import { PendingOrderTemplate } from "./templates/PendingOrderTemplate";
import { ProcessingOrderTemplate } from "./templates/ProcessingOrderTemplate";
import { ShippedOrderTemplate } from "./templates/ShippedOrderTemplate";
import { DeliveredOrderTemplate } from "./templates/DeliveredOrderTemplate";
import { CancelledOrderTemplate } from "./templates/CancelledOrderTemplate";

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
      let template: { subject: string; html: string; text: string };

      switch (status) {
        case "pending":
          template = {
            subject: PendingOrderTemplate.getSubject(orderId),
            html: PendingOrderTemplate.getHtml({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
            text: PendingOrderTemplate.getText({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
          };
          break;
        case "processing":
          template = {
            subject: ProcessingOrderTemplate.getSubject(orderId),
            html: ProcessingOrderTemplate.getHtml({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
            text: ProcessingOrderTemplate.getText({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
          };
          break;
        case "shipped":
          template = {
            subject: ShippedOrderTemplate.getSubject(orderId),
            html: ShippedOrderTemplate.getHtml({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
              trackingNumber: options?.trackingNumber,
              estimatedDelivery: options?.estimatedDelivery,
            }),
            text: ShippedOrderTemplate.getText({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
              trackingNumber: options?.trackingNumber,
              estimatedDelivery: options?.estimatedDelivery,
            }),
          };
          break;
        case "delivered":
          template = {
            subject: DeliveredOrderTemplate.getSubject(orderId),
            html: DeliveredOrderTemplate.getHtml({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
            text: DeliveredOrderTemplate.getText({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
            }),
          };
          break;
        case "cancelled":
          template = {
            subject: CancelledOrderTemplate.getSubject(orderId),
            html: CancelledOrderTemplate.getHtml({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
              cancellationReason: options?.cancellationReason,
            }),
            text: CancelledOrderTemplate.getText({
              customerName,
              customerEmail: toEmail,
              orderId,
              orderItems,
              totalAmount,
              cancellationReason: options?.cancellationReason,
            }),
          };
          break;
        default:
          throw new Error(`Unsupported order status: ${status}`);
      }

      // Send email using Next.js API route
      const result = await this.sendEmail(
        toEmail,
        template.subject,
        template.html,
        template.text,
      );

      // Log the email sent for tracking (optional)
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

  // Send email using Next.js API route
  private static async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Send email using Next.js API route
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          from: this.config.fromEmail,
          fromName: this.config.fromName,
          replyTo: this.config.replyToEmail,
          subject,
          html,
          text,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      return {
        success: true,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  // Log email sent for tracking purposes (console logging only)
  private static async logEmailSent(
    toEmail: string,
    orderId: string,
    status: string,
    subject: string,
  ): Promise<void> {
    try {
      // Console logging for now - you can implement database logging later
      console.log("Email sent:", {
        to: toEmail,
        orderId,
        status,
        subject,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging email:", error);
      // Don't throw error here as logging is not critical
    }
  }

  // Get email logs for an order (placeholder - implement with your preferred storage)
  static async getOrderEmailLogs(orderId: string): Promise<any[]> {
    try {
      // Placeholder implementation - you can implement this with your preferred storage
      console.log("Getting email logs for order:", orderId);
      return [];
    } catch (error) {
      console.error("Error fetching email logs:", error);
      return [];
    }
  }

  // Resend failed email (placeholder - implement with your preferred storage)
  static async resendOrderStatusEmail(
    emailLogId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Placeholder implementation - you can implement this with your preferred storage
      console.log("Resending email with log ID:", emailLogId);
      return {
        success: false,
        message: "Resend functionality not implemented yet",
      };
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
      const testTemplate = PendingOrderTemplate.getHtml({
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        orderId: "TEST-123",
        orderItems: [{ name: "Test Product", quantity: 1, price: 29.99 }],
        totalAmount: 29.99,
      });

      const result = await this.sendEmail(
        "test@example.com", // Replace with your test email
        "Test Email - Order Confirmation",
        testTemplate,
        "This is a test email to verify email configuration.",
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
