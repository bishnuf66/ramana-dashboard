export interface ProcessingOrderData {
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

export class ProcessingOrderTemplate {
  static getSubject(orderId: string): string {
    return `Order Update - #${orderId} - Now Processing`;
  }

  static getHtml(data: ProcessingOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Processing</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px 20px; background: #f9f9f9; border-radius: 0 0 10px 10px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .status-badge { background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .progress-item { display: flex; align-items: center; margin: 10px 0; }
          .progress-icon { width: 24px; height: 24px; margin-right: 10px; }
          .progress-text { flex: 1; }
          .progress-done { color: #4CAF50; }
          .progress-current { color: #2196F3; font-weight: bold; }
          .progress-pending { color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚙️ Order Processing</h1>
            <p>Your order is being prepared</p>
          </div>
          
          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>Good news! Your order #${data.orderId} is now being processed.</p>
            
            <div class="order-details">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Status:</strong> <span class="status-badge">⚙️ Processing</span></p>
              <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
              
              <h4>What's happening now?</h4>
              <div class="progress-item">
                <div class="progress-icon progress-done">✅</div>
                <div class="progress-text">Your payment has been confirmed</div>
              </div>
              <div class="progress-item">
                <div class="progress-icon progress-current">📦</div>
                <div class="progress-text">We're preparing your items</div>
              </div>
              <div class="progress-item">
                <div class="progress-icon progress-pending">🚚</div>
                <div class="progress-text">Your order will be shipped soon</div>
              </div>
            </div>
            
            <p>We're working hard to get your order ready for shipment. You'll receive another email once your order has been shipped.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #E3F2FD; padding: 15px; border-radius: 8px; border-left: 4px solid #2196F3;">
                <p style="margin: 0; color: #1976D2;"><strong>Estimated shipping:</strong> 1-2 business days</p>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your patience!</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 Your Store. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static getText(data: ProcessingOrderData): string {
    return `
Order Update - #${data.orderId} - Now Processing

Hello ${data.customerName},

Good news! Your order #${data.orderId} is now being processed.

Status: Processing
Total Amount: $${data.totalAmount.toFixed(2)}

What's happening now?
✅ Your payment has been confirmed
📦 We're preparing your items
🚚 Your order will be shipped soon

We're working hard to get your order ready for shipment. You'll receive another email once your order has been shipped.

Estimated shipping: 1-2 business days

Thank you for your patience!
© 2024 Your Store. All rights reserved.
    `;
  }
}
