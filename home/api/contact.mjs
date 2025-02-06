import { Resend } from "resend";

export const runtime = "nodejs";

const formatMessage = (message) => {
  return message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" style="color: #007bff; text-decoration: underline;">$1</a>'
    )
    .split("\n")
    .join("<br>");
};

export default async function handler(req, res) {
  const resend = new Resend(process.env.RESEND_KEY);

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.RESEND_FROM_EMAIL || !process.env.CONTACT_EMAIL) {
      return res.status(500).json({ error: "Email configuration missing" });
    }

    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `${name} | Contact Form Submission`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6; color: #333; max-width: 600px;">
          <div style="white-space: pre-wrap;">
            ${formatMessage(message)}
          </div>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            From: ${name} (${email})
          </div>
        </div>
      `,
      replyTo: email,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({
      error: "Error sending email",
      details: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
