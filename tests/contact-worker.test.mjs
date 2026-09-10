import assert from "node:assert/strict";
import test from "node:test";

import worker from "../worker.mjs";

const contactEnvironment = {
  ASSETS: {
    fetch: async () => new Response("asset"),
  },
  CONTACT_FROM_EMAIL: "Portfolio <contact@example.com>",
  CONTACT_TO_EMAIL: "owner@example.com",
  RESEND_API_KEY: "test-key",
};

function contactRequest(fields, headers = {}) {
  const body = new URLSearchParams(fields);

  return new Request("https://benjimanclarke.ie/contact/submit", {
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://benjimanclarke.ie",
      ...headers,
    },
    method: "POST",
  });
}

test("sends a valid contact form through Resend and redirects to the success page", async () => {
  const originalFetch = globalThis.fetch;
  let resendRequest;
  globalThis.fetch = async (request, options) => {
    resendRequest = { request, options };
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  };

  try {
    const response = await worker.fetch(
      contactRequest({
        email: "visitor@example.com",
        message: "Hello from the portfolio.",
        name: "Visitor",
      }),
      contactEnvironment,
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/contact-sent");
    assert.equal(resendRequest.request, "https://api.resend.com/emails");
    assert.equal(resendRequest.options.headers.Authorization, "Bearer test-key");
    assert.deepEqual(JSON.parse(resendRequest.options.body), {
      from: "Portfolio <contact@example.com>",
      reply_to: "visitor@example.com",
      subject: "Portfolio contact from Visitor",
      text: "Name: Visitor\nEmail: visitor@example.com\n\nHello from the portfolio.",
      to: ["owner@example.com"],
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects invalid form input without calling Resend", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("unexpected");
  };

  try {
    const response = await worker.fetch(
      contactRequest({ email: "not-an-email", message: "", name: "" }),
      contactEnvironment,
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/contact-error");
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects a filled honeypot without claiming delivery", async () => {
  const originalFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => {
    called = true;
    return new Response("unexpected");
  };

  try {
    const response = await worker.fetch(
      contactRequest({
        email: "visitor@example.com",
        message: "Hello",
        name: "Visitor",
        website: "https://example.com",
      }),
      contactEnvironment,
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/contact-error");
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("redirects to the error page when Resend rejects delivery", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("service unavailable", { status: 503 });

  try {
    const response = await worker.fetch(
      contactRequest({ email: "visitor@example.com", message: "Hello", name: "Visitor" }),
      contactEnvironment,
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/contact-error");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("redirects to the error page when Resend is unavailable", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("network unavailable");
  };

  try {
    const response = await worker.fetch(
      contactRequest({ email: "visitor@example.com", message: "Hello", name: "Visitor" }),
      contactEnvironment,
    );

    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "/contact-error");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("redirects to the error page when contact secrets are missing", async () => {
  const response = await worker.fetch(
    contactRequest({ email: "visitor@example.com", message: "Hello", name: "Visitor" }),
    { ASSETS: contactEnvironment.ASSETS },
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/contact-error");
});

test("rejects cross-origin form posts", async () => {
  const response = await worker.fetch(
    contactRequest(
      { email: "visitor@example.com", message: "Hello", name: "Visitor" },
      { origin: "https://example.com" },
    ),
    contactEnvironment,
  );

  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/contact-error");
});

test("only accepts POST at the contact endpoint", async () => {
  const response = await worker.fetch(
    new Request("https://benjimanclarke.ie/contact/submit"),
    contactEnvironment,
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
});

test("serves static assets for every other path", async () => {
  let assetRequest;
  const environment = {
    ...contactEnvironment,
    ASSETS: {
      fetch: async (request) => {
        assetRequest = request;
        return new Response("home page");
      },
    },
  };
  const request = new Request("https://benjimanclarke.ie/");

  const response = await worker.fetch(request, environment);

  assert.equal(await response.text(), "home page");
  assert.equal(assetRequest, request);
});
