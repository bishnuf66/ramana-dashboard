export interface PendingOrderData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export class PendingOrderTemplate {
  static getSubject(orderId: string): string {
    return `Order Confirmation - #${orderId}`;
  }

  static getHtml(data: PendingOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; }
          .order-item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .order-item:last-child { border-bottom: none; }
          .status-badge { background: #ff9800; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 Order Confirmed!</h1>
            <p>Thank you for your purchase</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Your order has been received and is now being processed. Here are your order details:</p>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Status:</strong> <span class="status-badge">⏳ Pending</span></p>
              <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
              
              <h4>Order Items:</h4>
              ${data.orderItems
                .map(
                  (item) => `
                <div class="order-item">
                  <strong>${item.name}</strong> x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                </div>
              `,
                )
                .join("")}
            </div>
            
            <p>We'll notify you as soon as your order moves to the next stage.</p>
            <p>You can track your order status in your account dashboard.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="btn">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: PendingOrderData): string {
    return `
Order Confirmation - #${data.orderId}

Hello ${data.customerName},

Thank you for your order! Your order has been received and is now being processed.

Order Details:
Order ID: ${data.orderId}
Status: Pending
Total Amount: $${data.totalAmount.toFixed(2)}

Order Items:
${data.orderItems.map((item) => `- ${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

We'll notify you as soon as your order moves to the next stage.

Thank you for shopping with us!
© 2024 Your Store. All rights reserved.
    `;
  }
}
