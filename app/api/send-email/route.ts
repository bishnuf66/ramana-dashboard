import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface EmailRequest {
  to: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();

    // Validate required fields
    if (!body.to || !body.from || !body.subject || !body.html) {
      return NextResponse.json(
        { error: "Missing required fields: to, from, subject, html" },
        { status: 400 },
      );
    }

    // Create transporter with your email service
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS || process.env.APP_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from: `${body.fromName} <${body.from}>`,
      to: body.to,
      replyTo: body.replyTo || body.from,
      subject: body.subject,
      html: body.html,
      text: body.text,
    };

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
