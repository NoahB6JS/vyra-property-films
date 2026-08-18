# VYRA — Cloudflare-ready website

This is the complete VYRA website converted from the original version to a Cloudflare Pages + Pages Functions + R2 architecture.

## What works
- Premium responsive website
- Property portfolio/demo sections
- Pricing and enquiry flow
- Up to 10 image uploads
- Server-side validation
- Cloudflare R2 image storage through a Pages Function
- Email notification through an HTTP email provider

## Important: one-time setup is still required
The ZIP is the complete site, but uploading the ZIP by itself does not magically create the Cloudflare database/storage/email connections. Before the form can send real enquiries you must connect the following in Cloudflare:

1. Deploy the site to Cloudflare Pages.
2. Create an R2 bucket for property uploads.
3. Bind that bucket to the Pages Function using the variable name `PROPERTY_UPLOADS`.
4. Add these Pages environment variables/secrets:
   - `EMAIL_API_URL`
   - `EMAIL_API_KEY`
   - `BUSINESS_EMAIL`
   - `EMAIL_FROM`
5. Redeploy.

The email function uses the common Resend-style send-email request. If using Resend, the endpoint is its current send-email API endpoint and `EMAIL_FROM` must be an address/domain the provider allows you to send from.

## Local development
Cloudflare's Wrangler CLI can run the Pages project locally. R2 bindings need to be configured for local testing.

## Before public launch
- Replace demo visuals with your actual films.
- Add a privacy policy because customers upload personal/property information.
- Add spam protection such as Cloudflare Turnstile.
- Decide how long uploaded property images should be retained.
- Connect a real domain once the brand is final.
