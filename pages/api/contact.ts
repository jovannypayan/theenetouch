
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, number, address, message } = req.body ?? {};

  if (
    [name, number, address, message].some(
      (value) => typeof value !== "string" || !value.trim()
    )
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY is missing");
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Ene's Cleaning <contact@theenetouch.com>",
        to: ["enes_cleaning@hotmail.com"],
        subject: "New Cleaning Request - Ene's Cleaning",
        text: [
          `Name: ${name.trim()}`,
          `Phone: ${number.trim()}`,
          `Address: ${address.trim()}`,
          "",
          "Message:",
          message.trim()
        ].join("\n")
      })
    });

    if (!response.ok) {
      console.error("Resend error:", response.status, await response.text());
      return res.status(502).json({ error: "Unable to send email" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
