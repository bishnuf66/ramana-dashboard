export interface ShippedOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export class ShippedOrderTemplate {
  static getSubject(orderId: string): string {
    return `Order Shipped - #${orderId} - On its way!`;
  }

  static getHtml(data: ShippedOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #9C27B0; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .tracking-info { background: #E8F5E8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-badge { background: #9C27B0; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .tracking-number { background: #4CAF50; color: white; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-weight: bold; }
          .delivery-info { background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Order Shipped!</h1>
            <p>Your order is on its way</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Exciting news! Your order #${data.orderId} has been shipped and is on its way to you.</p>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Status:</strong> <span class="status-badge">🚚 Shipped</span></p>
              <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
            </div>
            
            ${
              data.trackingNumber
                ? `
              <div class="tracking-info">
                <h4>📦 Tracking Information</h4>
                <p><strong>Tracking Number:</strong> <span class="tracking-number">${data.trackingNumber}</span></p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery || "3-5 business days"}</p>
                <p>You can track your package using the tracking number above.</p>
                <div style="text-align: center; margin: 15px 0;">
                  <a href="#" style="display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Package</a>
                </div>
              </div>
            `
                : ""
            }
            
            <div class="delivery-info">
              <h4>📦 Delivery Information</h4>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Your order should arrive within 3-5 business days</li>
                <li>Please make sure someone is available to receive the package</li>
                <li>Check your email for shipping updates</li>
                <li>Contact us if you have any delivery issues</li>
              </ul>
            </div>
            
            <p>We hope you enjoy your items! Thank you for choosing us.</p>
          </div>
          
          <div class="footer">
            <p>Thank you for your order!</p>
            <p>If you have any questions about your shipment, please contact our support team.</p>
            <p>&copy; 2024 Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: ShippedOrderData): string {
    return `
Order Shipped - #${data.orderId} - On its way!

Hello ${data.customerName},

Exciting news! Your order #${data.orderId} has been shipped and is on its way to you.

Status: Shipped
Total Amount: $${data.totalAmount.toFixed(2)}

${
  data.trackingNumber
    ? `
Tracking Information:
Tracking Number: ${data.trackingNumber}
Estimated Delivery: ${data.estimatedDelivery || "3-5 business days"}

You can track your package using the tracking number above.
`
    : ""
}

Delivery Information:
• Your order should arrive within 3-5 business days
• Please make sure someone is available to receive the package
• Check your email for shipping updates
• Contact us if you have any delivery issues

We hope you enjoy your items! Thank you for choosing us.

© 2024 Your Store. All rights reserved.
    `;
  }
}
