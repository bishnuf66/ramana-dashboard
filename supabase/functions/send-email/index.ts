import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, from, fromName, replyTo, subject, html, text }: EmailRequest =
      await req.json();

    // Validate required fields
    if (!to || !from || !subject || !html) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, from, subject, html",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Option 1: Using Resend (recommended for production)
    if (Deno.env.get("RESEND_API_KEY")) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${from}>`,
          to: [to],
          reply_to: replyTo || from,
          subject,
          html,
          text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Resend API error:", data);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: data }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
          data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Option 2: Using SendGrid
    if (Deno.env.get("SENDGRID_API_KEY")) {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: to }],
            },
          ],
          from: {
            email: from,
            name: fromName,
          },
          reply_to: replyTo ? { email: replyTo } : undefined,
          subject,
          content: [
            { type: "text/plain", value: text },
            { type: "text/html", value: html },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("SendGrid API error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: errorData }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Option 3: Using Brevo (formerly Sendinblue)
    if (Deno.env.get("BREVO_API_KEY")) {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": Deno.env.get("BREVO_API_KEY")!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: fromName,
            email: from,
          },
          to: [{ email: to }],
          replyTo: { email: replyTo || from },
          subject,
          htmlContent: html,
          textContent: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Brevo API error:", data);
        return new Response(
          JSON.stringify({ error: "Failed to send email", details: data }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email sent successfully",
          data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // Option 4: Development mode - just log the email
    if (Deno.env.get("ENVIRONMENT") === "development") {
      console.log("📧 Email would be sent:", {
        to,
        from: `${fromName} <${from}>`,
        subject,
        html: html.substring(0, 200) + "...",
        text: text.substring(0, 100) + "...",
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email logged in development mode",
          development: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    // No email service configured
    return new Response(
      JSON.stringify({
        error: "No email service configured",
        message:
          "Please configure RESEND_API_KEY, SENDGRID_API_KEY, or BREVO_API_KEY in your Supabase Edge Function secrets",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  } catch (error) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
