import {
  EmailTemplates,
  OrderEmailData,
  EmailTemplate,
} from "./EmailTemplates";
import { supabase } from "@/lib/supabase/client";

export interface EmailServiceConfig {
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
}

export class EmailService {
  private static config: EmailServiceConfig = {
    fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@yourstore.com",
    fromName: process.env.NEXT_PUBLIC_FROM_NAME || "Your Store",
    replyToEmail:
      process.env.NEXT_PUBLIC_REPLY_TO_EMAIL || "support@yourstore.com",
  };

  // Send order status update email
  static async sendOrderStatusUpdate(
    toEmail: string,
    customerName: string,
    orderId: string,
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled",
    orderItems: Array<{ name: string; quantity: number; price: number }>,
    totalAmount: number,
    options?: {
      trackingNumber?: string;
      estimatedDelivery?: string;
      cancellationReason?: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    try {
      const emailData: OrderEmailData = {
        customerName,
        customerEmail: toEmail,
        orderId,
        orderItems,
        totalAmount,
        trackingNumber: options?.trackingNumber,
        estimatedDelivery: options?.estimatedDelivery,
        cancellationReason: options?.cancellationReason,
      };

      let template: EmailTemplate;

      switch (status) {
        case "pending":
          template = EmailTemplates.pendingOrder(emailData);
          break;
        case "processing":
          template = EmailTemplates.processingOrder(emailData);
          break;
        case "shipped":
          template = EmailTemplates.shippedOrder(emailData);
          break;
        case "delivered":
          template = EmailTemplates.deliveredOrder(emailData);
          break;
        case "cancelled":
          template = EmailTemplates.cancelledOrder(emailData);
          break;
        default:
          throw new Error(`Unsupported order status: ${status}`);
      }

      // Send email using Supabase Edge Function or your preferred email service
      const result = await this.sendEmail(
        toEmail,
        template.subject,
        template.html,
        template.text,
      );

      // Log the email sent for tracking
      await this.logEmailSent(toEmail, orderId, status, template.subject);

      return result;
    } catch (error) {
      console.error("Error sending order status email:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  // Send email using your preferred email service
  private static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Option 1: Using Supabase Edge Functions (recommended)
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to,
          from: this.config.fromEmail,
          fromName: this.config.fromName,
          replyTo: this.config.replyToEmail,
          subject,
          html,
          text,
        },
      });

      if (error) throw error;

      return {
        success: true,
        message: "Email sent successfully",
      };

      /* 
      // Option 2: Using Resend (alternative)
      import { Resend } from 'resend';
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        subject,
        html,
        text
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Email sent successfully'
      };

      // Option 3: Using SendGrid (alternative)
      import sgMail from '@sendgrid/mail';
      sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

      const msg = {
        to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        subject,
        html,
        text
      };

      await sgMail.send(msg);

      return {
        success: true,
        message: 'Email sent successfully'
      };
      */
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  // Log email sent for tracking purposes
  private static async logEmailSent(
    toEmail: string,
    orderId: string,
    status: string,
    subject: string,
  ): Promise<void> {
    try {
      await supabase.from("email_logs").insert({
        to_email: toEmail,
        order_id: orderId,
        order_status: status,
        subject,
        sent_at: new Date().toISOString(),
        status: "sent",
      });
    } catch (error) {
      console.error("Error logging email:", error);
      // Don't throw error here as logging is not critical
    }
  }

  // Get email logs for an order
  static async getOrderEmailLogs(orderId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .eq("order_id", orderId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching email logs:", error);
      return [];
    }
  }

  // Resend failed email
  static async resendOrderStatusEmail(
    emailLogId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { data: logData, error: logError } = await supabase
        .from("email_logs")
        .select("*")
        .eq("id", emailLogId)
        .single();

      if (logError) throw logError;

      // Resend the email with the same data
      const result = await this.sendOrderStatusUpdate(
        logData.to_email,
        "", // customer name would need to be fetched from order
        logData.order_id,
        logData.order_status as any,
        [], // order items would need to be fetched from order
        0, // total amount would need to be fetched from order
      );

      if (result.success) {
        // Update the log entry
        await supabase
          .from("email_logs")
          .update({
            sent_at: new Date().toISOString(),
            status: "resent",
          })
          .eq("id", emailLogId);
      }

      return result;
    } catch (error) {
      console.error("Error resending email:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to resend email",
      };
    }
  }

  // Test email configuration
  static async testEmailConfiguration(): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const testTemplate = EmailTemplates.pendingOrder({
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        orderId: "TEST-123",
        orderItems: [{ name: "Test Product", quantity: 1, price: 29.99 }],
        totalAmount: 29.99,
      });

      const result = await this.sendEmail(
        "test@example.com", // Replace with your test email
        testTemplate.subject,
        testTemplate.html,
        testTemplate.text,
      );

      return result;
    } catch (error) {
      console.error("Error testing email configuration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Email test failed",
      };
    }
  }
}
