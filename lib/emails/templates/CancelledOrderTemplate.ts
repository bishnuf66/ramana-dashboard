export interface CancelledOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  cancellationReason?: string;
}

export class CancelledOrderTemplate {
  static getSubject(orderId: string): string {
    return `Order Cancelled - #${orderId}`;
  }

  static getHtml(data: CancelledOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f44336; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .cancellation-info { background: #FFEBEE; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f44336; }
          .refund-info { background: #E3F2FD; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2196F3; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-badge { background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .refund-timeline { background: #F5F5F5; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Order Cancelled</h1>
            <p>Your order has been cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>We're writing to inform you that your order #${data.orderId} has been cancelled.</p>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Status:</strong> <span class="status-badge">❌ Cancelled</span></p>
              <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
            </div>
            
            ${
              data.cancellationReason
                ? `
              <div class="cancellation-info">
                <h4>📝 Cancellation Reason</h4>
                <p>${data.cancellationReason}</p>
              </div>
            `
                : ""
            }
            
            <div class="refund-info">
              <h4>💳 Refund Information</h4>
              <p>If you've already paid for this order, a refund will be processed to your original payment method.</p>
              <p>Please allow 3-5 business days for the refund to appear in your account.</p>
              
              <div class="refund-timeline">
                <h5>Refund Timeline:</h5>
                <p><strong>• Today:</strong> Order cancelled</p>
                <p><strong>• 1-2 business days:</strong> Refund initiated</p>
                <p><strong>• 3-5 business days:</strong> Refund appears in your account</p>
              </div>
            </div>
            
            <p>We apologize for any inconvenience this may have caused. If you have any questions about the cancellation or refund, please contact our support team.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; border-left: 4px solid #FF9800;">
                <p style="margin: 0; color: #F57C00;"><strong>Need Help?</strong></p>
                <p style="margin: 5px 0;">Contact our support team:</p>
                <p style="margin: 0;">📧 support@yourstore.com | 📞 1-800-123-4567</p>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>We're sorry to see you go!</p>
            <p>If you'd like to place a new order, please visit our website.</p>
            <p>&copy; 2024 Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: CancelledOrderData): string {
    return `
Order Cancelled - #${data.orderId}

Hello ${data.customerName},

We're writing to inform you that your order #${data.orderId} has been cancelled.

Status: Cancelled
Total Amount: $${data.totalAmount.toFixed(2)}

${data.cancellationReason ? `Cancellation Reason: ${data.cancellationReason}` : ""}

Refund Information:
If you've already paid for this order, a refund will be processed to your original payment method.
Please allow 3-5 business days for the refund to appear in your account.

Refund Timeline:
• Today: Order cancelled
• 1-2 business days: Refund initiated
• 3-5 business days: Refund appears in your account

We apologize for any inconvenience this may have caused. If you have any questions about the cancellation or refund, please contact our support team.

Need Help?
Contact our support team:
📧 support@yourstore.com | 📞 1-800-123-4567

We're sorry to see you go!
If you'd like to place a new order, please visit our website.

© 2024 Your Store. All rights reserved.
    `;
  }
}
