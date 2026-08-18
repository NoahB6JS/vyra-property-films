export async function onRequestPost({ request, env }) {
  const reply = (body, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });

  try {
    const form = await request.formData();
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const company = String(form.get("company") || "").trim();
    const propertyType = String(form.get("propertyType") || "").trim();
    const pkg = String(form.get("package") || "").trim();
    const message = String(form.get("message") || "").trim();
    const files = form.getAll("images").filter(x => x instanceof File);

    if (!name || !email) return reply({ message: "Please provide your name and email." }, 400);
    if (!files.length) return reply({ message: "Please upload at least one property image." }, 400);
    if (files.length > 10) return reply({ message: "Please upload no more than 10 images." }, 400);

    if (!env.PROPERTY_UPLOADS) {
      return reply({ message: "The website is online, but image storage has not been connected yet." }, 503);
    }

    const enquiryId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const stored = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) return reply({ message: `${file.name} is larger than 5MB.` }, 400);
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return reply({ message: `${file.name} is not a supported image type.` }, 400);
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `enquiries/${enquiryId}/${String(i + 1).padStart(2, "0")}-${safeName}`;
      await env.PROPERTY_UPLOADS.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
        customMetadata: { enquiryId, originalName: file.name, customerEmail: email }
      });
      stored.push(key);
    }

    const text = `NEW VYRA PROJECT ENQUIRY\n\nName: ${name}\nEmail: ${email}\nCompany / Host: ${company || "-"}\nProperty type: ${propertyType || "-"}\nPackage: ${pkg || "-"}\n\nABOUT THE PROPERTY\n${message || "-"}\n\nUPLOADED IMAGES\n${stored.map((x, i) => `${i + 1}. ${x}`).join("\n")}\n\nEnquiry ID: ${enquiryId}`;

    // Configure these as Cloudflare Pages secrets/variables.
    // The endpoint/body below is compatible with Resend's send-email API.
    if (!env.EMAIL_API_URL || !env.EMAIL_API_KEY || !env.BUSINESS_EMAIL || !env.EMAIL_FROM) {
      return reply({ message: "Your enquiry was saved, but email delivery is not configured yet." }, 503);
    }

    const emailResponse = await fetch(env.EMAIL_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${env.EMAIL_API_KEY}`
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [env.BUSINESS_EMAIL],
        reply_to: email,
        subject: `New VYRA enquiry — ${name}`,
        text
      })
    });

    if (!emailResponse.ok) {
      console.error(await emailResponse.text());
      return reply({ message: "The enquiry was received, but the email notification could not be sent." }, 502);
    }

    return reply({ ok: true });
  } catch (error) {
    console.error(error);
    return reply({ message: "Something went wrong while sending your enquiry. Please try again." }, 500);
  }
}
