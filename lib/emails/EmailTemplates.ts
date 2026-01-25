export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderEmailData {
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
  cancellationReason?: string;
}

export class EmailTemplates {
  // PENDING ORDER TEMPLATE
  static pendingOrder(data: OrderEmailData): EmailTemplate {
    return {
      subject: `Order Confirmation - #${data.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
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
                <p><strong>Status:</strong> <span style="color: #ff9800;">⏳ Pending</span></p>
                <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
                
                <h4>Order Items:</h4>
                <ul>
                  ${data.orderItems
                    .map(
                      (item) => `
                    <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
              
              <p>We'll notify you as soon as your order moves to the next stage.</p>
              <p>You can track your order status in your account dashboard.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for shopping with us!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
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
      `,
    };
  }

  // PROCESSING ORDER TEMPLATE
  static processingOrder(data: OrderEmailData): EmailTemplate {
    return {
      subject: `Order Update - #${data.orderId} - Now Processing`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Processing</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
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
                <p><strong>Status:</strong> <span style="color: #2196F3;">⚙️ Processing</span></p>
                <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
                
                <h4>What's happening now?</h4>
                <ul>
                  <li>✅ Your payment has been confirmed</li>
                  <li>📦 We're preparing your items</li>
                  <li>🚚 Your order will be shipped soon</li>
                </ul>
              </div>
              
              <p>We're working hard to get your order ready for shipment. You'll receive another email once your order has been shipped.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your patience!</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Update - #${data.orderId} - Now Processing
        
        Hello ${data.customerName},
        
        Good news! Your order #${data.orderId} is now being processed.
        
        Status: Processing
        Total Amount: $${data.totalAmount.toFixed(2)}
        
        What's happening now?
        ✓ Your payment has been confirmed
        ✓ We're preparing your items
        ✓ Your order will be shipped soon
        
        We're working hard to get your order ready for shipment. You'll receive another email once your order has been shipped.
        
        Thank you for your patience!
      `,
    };
  }

  // SHIPPED ORDER TEMPLATE
  static shippedOrder(data: OrderEmailData): EmailTemplate {
    return {
      subject: `Order Shipped - #${data.orderId} - On its way!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Shipped</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .tracking-info { background: #E8F5E8; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background: #9C27B0; color: white; text-decoration: none; border-radius: 5px; }
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
                <p><strong>Status:</strong> <span style="color: #9C27B0;">🚚 Shipped</span></p>
                <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
              </div>
              
              ${
                data.trackingNumber
                  ? `
                <div class="tracking-info">
                  <h4>📦 Tracking Information</h4>
                  <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                  <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery || "3-5 business days"}</p>
                  <p>You can track your package using the tracking number above.</p>
                </div>
              `
                  : ""
              }
              
              <p>Your order should arrive within 3-5 business days. Please make sure someone is available to receive the package.</p>
            </div>
            
            <div class="footer">
              <p>Thank you for your order!</p>
              <p>If you have any questions about your shipment, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
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
        
        Your order should arrive within 3-5 business days. Please make sure someone is available to receive the package.
        
        Thank you for your order!
      `,
    };
  }

  // DELIVERED ORDER TEMPLATE
  static deliveredOrder(data: OrderEmailData): EmailTemplate {
    return {
      subject: `Order Delivered - #${data.orderId} - Enjoy!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .success-message { background: #E8F5E8; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .btn { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
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
              
              <div class="order-details">
                <h3>Order #${data.orderId}</h3>
                <p><strong>Status:</strong> <span style="color: #4CAF50;">✅ Delivered</span></p>
                <p><strong>Total Amount:</strong> $${data.totalAmount.toFixed(2)}</p>
              </div>
              
              <div class="success-message">
                <h4>🎉 Thank you for your purchase!</h4>
                <p>We hope you enjoy your items. If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>✅ Check your items to ensure everything is in order</li>
                <li>⭐ Leave a review for the products you purchased</li>
                <li>📧 Contact us if you have any issues</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>We appreciate your business!</p>
              <p>Looking forward to serving you again soon.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Delivered - #${data.orderId} - Enjoy!
        
        Hello ${data.customerName},
        
        Great news! Your order #${data.orderId} has been successfully delivered.
        
        Status: Delivered
        Total Amount: $${data.totalAmount.toFixed(2)}
        
        🎉 Thank you for your purchase!
        
        We hope you enjoy your items. If you have any questions or concerns about your order, please don't hesitate to contact us.
        
        Next Steps:
        ✓ Check your items to ensure everything is in order
        ⭐ Leave a review for the products you purchased
        📧 Contact us if you have any issues
        
        We appreciate your business!
        Looking forward to serving you again soon.
      `,
    };
  }

  // CANCELLED ORDER TEMPLATE
  static cancelledOrder(data: OrderEmailData): EmailTemplate {
    return {
      subject: `Order Cancelled - #${data.orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancelled</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .cancellation-info { background: #FFEBEE; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f44336; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
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
                <p><strong>Status:</strong> <span style="color: #f44336;">❌ Cancelled</span></p>
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
              
              <div class="cancellation-info">
                <h4>💳 Refund Information</h4>
                <p>If you've already paid for this order, a refund will be processed to your original payment method.</p>
                <p>Please allow 3-5 business days for the refund to appear in your account.</p>
              </div>
              
              <p>We apologize for any inconvenience this may have caused. If you have any questions about the cancellation or refund, please contact our support team.</p>
            </div>
            
            <div class="footer">
              <p>We're sorry to see you go!</p>
              <p>If you'd like to place a new order, please visit our website.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Order Cancelled - #${data.orderId}
        
        Hello ${data.customerName},
        
        We're writing to inform you that your order #${data.orderId} has been cancelled.
        
        Status: Cancelled
        Total Amount: $${data.totalAmount.toFixed(2)}
        
        ${data.cancellationReason ? `Cancellation Reason: ${data.cancellationReason}` : ""}
        
        Refund Information:
        If you've already paid for this order, a refund will be processed to your original payment method.
        Please allow 3-5 business days for the refund to appear in your account.
        
        We apologize for any inconvenience this may have caused. If you have any questions about the cancellation or refund, please contact our support team.
        
        We're sorry to see you go!
        If you'd like to place a new order, please visit our website.
      `,
    };
  }
}
