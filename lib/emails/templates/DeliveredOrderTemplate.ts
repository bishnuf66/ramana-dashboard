export interface DeliveredOrderData {
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

export class DeliveredOrderTemplate {
  static getSubject(orderId: string): string {
    return `Order Delivered - #${orderId} - Enjoy!`;
  }

  static getHtml(data: DeliveredOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .success-message { background: #E8F5E8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-badge { background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .next-steps { background: #FFF3E0; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .next-steps ul { margin: 0; padding-left: 20px; }
          .next-steps li { margin: 8px 0; }
          .btn { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
          .celebration { font-size: 48px; margin: 20px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Delivered!</h1>
            <p>Enjoy your purchase!</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Great news! Your order #${data.orderId} has been successfully delivered.</p>
            
            <div class="celebration">🎉</div>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Status:</strong> <span class="status-badge">✅ Delivered</span></p>
              <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
            </div>
            
            <div class="success-message">
              <h4>🎉 Thank you for your purchase!</h4>
              <p>We hope you enjoy your items. If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
            </div>
            
            <div class="next-steps">
              <h4>📋 Next Steps:</h4>
              <ul>
                <li>✅ Check your items to ensure everything is in order</li>
                <li>⭐ Leave a review for the products you purchased</li>
                <li>📧 Contact us if you have any issues</li>
                <li>🛍️ Shop again for more great products</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" class="btn">Leave a Review</a>
              <a href="#" class="btn" style="background: #FF9800;">Shop Again</a>
            </div>
          </div>
          
          <div class="footer">
            <p>We appreciate your business!</p>
            <p>Looking forward to serving you again soon.</p>
            <p>&copy; 2024 Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: DeliveredOrderData): string {
    return `
Order Delivered - #${data.orderId} - Enjoy!

Hello ${data.customerName},

Great news! Your order #${data.orderId} has been successfully delivered.

Status: Delivered
Total Amount: $${data.totalAmount.toFixed(2)}

🎉 Thank you for your purchase!

We hope you enjoy your items. If you have any questions or concerns about your order, please don't hesitate to contact us.

Next Steps:
✅ Check your items to ensure everything is in order
⭐ Leave a review for the products you purchased
📧 Contact us if you have any issues
🛍️ Shop again for more great products

We appreciate your business!
Looking forward to serving you again soon.

© 2024 Your Store. All rights reserved.
    `;
  }
}
