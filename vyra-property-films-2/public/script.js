const files = document.getElementById("files");
const fileList = document.getElementById("fileList");
const form = document.getElementById("quoteForm");
const status = document.getElementById("formStatus");

files?.addEventListener("change", () => {
  fileList.innerHTML = "";
  const selected = [...files.files];
  if (selected.length > 10) {
    files.value = "";
    status.textContent = "Please choose no more than 10 images.";
    status.className = "form-status error";
    return;
  }
  for (const file of selected) {
    const item = document.createElement("div");
    item.className = "file-item";
    item.innerHTML = `<span>${file.name}</span><span>${(file.size/1024/1024).toFixed(1)} MB</span>`;
    fileList.appendChild(item);
  }
});

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Uploading your property images and sending your enquiry…";
  status.className = "form-status";
  const data = new FormData(form);
  try {
    const res = await fetch(form.action, { method:"POST", body:data });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Something went wrong.");
    status.textContent = "Thanks — your enquiry has been sent. We'll be in touch shortly.";
    status.className = "form-status success";
    form.reset();
    fileList.innerHTML = "";
  } catch (err) {
    status.textContent = err.message || "We couldn't send the enquiry. Please try again.";
    status.className = "form-status error";
  }
});
