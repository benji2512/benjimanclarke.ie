const CONTACT_PATH = "/contact/submit";
const ERROR_PATH = "/contact-error";
const SUCCESS_PATH = "/contact-sent";
const RESEND_EMAILS_URL = "https://api.resend.com/emails";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function redirect(path) {
  return new Response(null, {
    headers: { Location: path },
    status: 303,
  });
}

function isValidContact({ name, email, message }) {
  return (
    name.length > 0 &&
    name.length <= 120 &&
    EMAIL_PATTERN.test(email) &&
    email.length <= 254 &&
    message.length > 0 &&
    message.length <= 5000
  );
}

function hasSameOrigin(request) {
  const origin = request.headers.get("Origin");
  return origin === new URL(request.url).origin;
}

async function sendContactEmail({ name, email, message }, environment) {
  if (
    !environment.CONTACT_FROM_EMAIL ||
    !environment.CONTACT_TO_EMAIL ||
    !environment.RESEND_API_KEY
  ) {
    return false;
  }

  const response = await fetch(RESEND_EMAILS_URL, {
    body: JSON.stringify({
      from: environment.CONTACT_FROM_EMAIL,
      reply_to: email,
      subject: `Portfolio contact from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      to: [environment.CONTACT_TO_EMAIL],
    }),
    headers: {
      Authorization: `Bearer ${environment.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  return response.ok;
}

async function handleContactSubmission(request, environment) {
  if (!hasSameOrigin(request)) {
    return redirect(ERROR_PATH);
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return redirect(ERROR_PATH);
  }

  const website = String(form.get("website") || "").trim();
  if (website) {
    return redirect(ERROR_PATH);
  }

  const contact = {
    email: String(form.get("email") || "").trim(),
    message: String(form.get("message") || "").trim(),
    name: String(form.get("name") || "").trim(),
  };

  if (!isValidContact(contact)) {
    return redirect(ERROR_PATH);
  }

  try {
    return (await sendContactEmail(contact, environment))
      ? redirect(SUCCESS_PATH)
      : redirect(ERROR_PATH);
  } catch (error) {
    console.error("Contact email delivery failed", error);
    return redirect(ERROR_PATH);
  }
}

export default {
  async fetch(request, environment) {
    const url = new URL(request.url);

    if (url.pathname === CONTACT_PATH) {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          headers: { Allow: "POST" },
          status: 405,
        });
      }

      return handleContactSubmission(request, environment);
    }

    return environment.ASSETS.fetch(request);
  },
};
