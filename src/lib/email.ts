import nodemailer from 'nodemailer';
import { logger } from './logger';
import { STORE_CONFIG, getStoreHoursDisplay } from './storeConfig';

// Email configuration interface
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email template interface
interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check if email configuration is available
      const emailConfig = this.getEmailConfig();
      if (!emailConfig) {
        logger.warn('Email service not configured - missing environment variables');
        return;
      }

      this.config = emailConfig;
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        auth: emailConfig.auth,
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service', error);
    }
  }

  private getEmailConfig(): EmailConfig | null {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      return null;
    }

    return {
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    };
  }

  public isConfigured(): boolean {
    return this.transporter !== null && this.config !== null;
  }

  public getAdminEmail(): string | null {
    return process.env.ADMIN_EMAIL || null;
  }

  public async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('Email service not configured - cannot send email');
      return false;
    }

    try {
      const mailOptions = {
        from: `"TaYaima" <${this.config!.auth.user}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter!.sendMail(mailOptions);
      logger.info('Email sent successfully', { 
        to, 
        subject, 
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send email', error, { to, subject });
      return false;
    }
  }

  public async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    userName?: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    const template = this.getPasswordResetTemplate(resetUrl, userName);

    return await this.sendEmail(to, template.subject, template.html, template.text);
  }

  private getPasswordResetTemplate(resetUrl: string, userName?: string): EmailTemplate {
    const greeting = userName ? `Hi ${userName}` : 'Hello';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - TaYaima</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .email-container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 2rem;
            margin-bottom: 10px;
          }
          .brand {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2563eb;
            margin: 0;
          }
          .content {
            margin-bottom: 30px;
          }
          .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
          }
          .reset-button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 0.9rem;
            color: #6b7280;
            text-align: center;
          }
          .link {
            color: #2563eb;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="logo">🏪</div>
            <h1 class="brand">TaYaima</h1>
          </div>
          
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>${greeting},</p>
            <p>We received a request to reset your password for your TaYaima account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Your Password</a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 15 minutes for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p class="link">${resetUrl}</p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The TaYaima Team</p>
            <p>This is an automated email. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Password Reset Request - TaYaima

${greeting},

We received a request to reset your password for your TaYaima account.

To reset your password, click on the following link (valid for 15 minutes):
${resetUrl}

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.

Best regards,
The TaYaima Team

This is an automated email. Please do not reply to this message.
    `;

    return {
      subject: 'Reset Your TaYaima Password',
      html,
      text: text.trim(),
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Test email configuration
  public async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      logger.error('Email service not configured - cannot test connection');
      return false;
    }

    try {
      await this.transporter!.verify();
      logger.info('Email service connection test successful');
      return true;
    } catch (error) {
      logger.error('Email service connection test failed', error);
      return false;
    }
  }

  public async sendOrderConfirmationEmail(
    to: string,
    orderId: string,
    customerName: string,
    totalAmount: number,
    items: any[],
    deliveryMethod?: string,
    address?: string,
    city?: string,
    pincode?: string
  ): Promise<boolean> {
    const template = this.getOrderConfirmationTemplate(
      orderId, 
      customerName, 
      totalAmount, 
      items,
      deliveryMethod,
      address,
      city,
      pincode
    );
    return await this.sendEmail(to, template.subject, template.html, template.text);
  }

  public async sendOrderStatusUpdateEmail(
    to: string,
    orderId: string,
    customerName: string,
    status: string,
    items: any[]
  ): Promise<boolean> {
    const template = this.getOrderStatusUpdateTemplate(orderId, customerName, status, items);
    return await this.sendEmail(to, template.subject, template.html, template.text);
  }

  private getOrderConfirmationTemplate(
    orderId: string,
    customerName: string,
    totalAmount: number,
    items: any[],
    deliveryMethod?: string,
    address?: string,
    city?: string,
    pincode?: string
  ): EmailTemplate {
    const isPickup = deliveryMethod === 'PICKUP';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - TaYaima</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">Order Confirmation - TaYaima</h2>
          <p>Hello ${customerName},</p>
          <p>Thank you for your order! Your order has been placed successfully.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> ₹${(totalAmount / 100).toFixed(2)}</p>
            <p><strong>Order Type:</strong> ${isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}</p>
          </div>
          
          ${isPickup ? `
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3;">
            <h3 style="margin-top: 0; color: #1976d2;">📍 Pickup Location:</h3>
            <p style="margin: 5px 0;"><strong>${STORE_CONFIG.name}</strong></p>
            <p style="margin: 5px 0;">${STORE_CONFIG.address.line1}</p>
            <p style="margin: 5px 0;">${STORE_CONFIG.address.line2}</p>
            <p style="margin: 5px 0;">${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.state} - ${STORE_CONFIG.address.pincode}</p>
            <p style="margin: 5px 0;"><strong>📞 Phone:</strong> ${STORE_CONFIG.contact.phone}</p>
            
            <h3 style="margin-top: 15px; color: #1976d2;">🕒 Store Hours:</h3>
            ${getStoreHoursDisplay().map(hours => `<p style="margin: 5px 0;">${hours}</p>`).join('')}
          </div>
          
          <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
            <h3 style="margin-top: 0; color: #f57c00;">ℹ️ Important Pickup Instructions:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Please bring your Order ID: ${orderId}</strong></li>
              <li>For any queries, call us at ${STORE_CONFIG.contact.phone}</li>
            </ul>
          </div>
          ` : `
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📦 Delivery Address:</h3>
            <p style="margin: 5px 0;">${address || ''}</p>
            ${city ? `<p style="margin: 5px 0;">${city}${pincode ? ` - ${pincode}` : ''}</p>` : ''}
          </div>
          `}
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items Ordered:</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${item.productName} × ${item.quantity} = ₹${(item.unitPrice * item.quantity / 100).toFixed(2)}
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p>${isPickup ? "We'll notify you when your order is ready for pickup." : "We'll notify you when your order is shipped."}</p>
          <p>Best regards,<br><strong>TaYaima Team</strong></p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Confirmation - TaYaima
      
      Hello ${customerName},
      
      Thank you for your order! Your order has been placed successfully.
      
      Order Details:
      Order ID: ${orderId}
      Total Amount: ₹${(totalAmount / 100).toFixed(2)}
      Order Type: ${isPickup ? 'Store Pickup' : 'Home Delivery'}
      
      ${isPickup ? `
      Pickup Location:
      ${STORE_CONFIG.name}
      ${STORE_CONFIG.address.line1}
      ${STORE_CONFIG.address.line2}
      ${STORE_CONFIG.address.city}, ${STORE_CONFIG.address.state} - ${STORE_CONFIG.address.pincode}
      Phone: ${STORE_CONFIG.contact.phone}
      
      Store Hours:
      ${getStoreHoursDisplay().join('\n      ')}
      
      Important: ${STORE_CONFIG.pickupInstructions[0]}
      ` : `
      Delivery Address:
      ${address || ''}
      ${city ? `${city}${pincode ? ` - ${pincode}` : ''}` : ''}
      `}
      
      Items Ordered:
      ${items.map(item => `- ${item.productName} × ${item.quantity} = ₹${(item.unitPrice * item.quantity / 100).toFixed(2)}`).join('\n      ')}
      
      ${isPickup ? "We'll notify you when your order is ready for pickup." : "We'll notify you when your order is shipped."}
      
      Best regards,
      TaYaima Team
    `;

    return {
      subject: `Order Confirmation #${orderId} - TaYaima`,
      html,
      text
    };
  }

  private getOrderStatusUpdateTemplate(
    orderId: string,
    customerName: string,
    status: string,
    items: any[]
  ): EmailTemplate {
    const statusMessages = {
      'SHIPPED': 'Your order has been shipped and is on its way!',
      'DELIVERED': 'Your order has been delivered successfully!',
      'CANCELLED': 'Your order has been cancelled.'
    };
    
    const message = statusMessages[status as keyof typeof statusMessages] || 'Your order status has been updated.';
    const statusColor = status === 'DELIVERED' ? '#28a745' : status === 'CANCELLED' ? '#dc3545' : '#007bff';
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update - TaYaima</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: ${statusColor}; margin-bottom: 20px;">Order Update - TaYaima</h2>
          <p>Hello ${customerName},</p>
          <p>${message}</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${item.variant.product.name} - ${item.variant.amount} ${item.variant.unit} × ${item.quantity}
                </li>
              `).join('')}
            </ul>
          </div>
          
          <p>Thank you for choosing TaYaima!</p>
          <p>Best regards,<br><strong>TaYaima Team</strong></p>
        </div>
      </body>
      </html>
    `;

    const text = `
      Order Update - TaYaima
      
      Hello ${customerName},
      
      ${message}
      
      Order Details:
      Order ID: ${orderId}
      Status: ${status}
      
      Items:
      ${items.map(item => `- ${item.variant.product.name} - ${item.variant.amount} ${item.variant.unit} × ${item.quantity}`).join('\n')}
      
      Thank you for choosing TaYaima!
      
      Best regards,
      TaYaima Team
    `;

    return {
      subject: `Order Update #${orderId} - ${status} - TaYaima`,
      html,
      text
    };
  }

  // Admin notification methods
  public async sendAdminNewOrderNotification(
    orderId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    totalAmount: number,
    deliveryMethod: string,
    address?: string,
    city?: string,
    pincode?: string,
    items?: any[]
  ): Promise<boolean> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      logger.warn('Admin email not configured - skipping admin notification');
      return false;
    }

    const template = this.getAdminNewOrderTemplate(
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      totalAmount,
      deliveryMethod,
      address,
      city,
      pincode,
      items
    );
    return await this.sendEmail(adminEmail, template.subject, template.html, template.text);
  }

  public async sendAdminOrderCancellationNotification(
    orderId: string,
    customerName: string,
    totalAmount: number,
    cancellationReason?: string
  ): Promise<boolean> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      logger.warn('Admin email not configured - skipping admin notification');
      return false;
    }

    const template = this.getAdminOrderCancellationTemplate(
      orderId,
      customerName,
      totalAmount,
      cancellationReason
    );
    return await this.sendEmail(adminEmail, template.subject, template.html, template.text);
  }

  public async sendAdminOrderDeliveredNotification(
    orderId: string,
    customerName: string,
    totalAmount: number
  ): Promise<boolean> {
    const adminEmail = this.getAdminEmail();
    if (!adminEmail) {
      logger.warn('Admin email not configured - skipping admin notification');
      return false;
    }

    const template = this.getAdminOrderDeliveredTemplate(orderId, customerName, totalAmount);
    return await this.sendEmail(adminEmail, template.subject, template.html, template.text);
  }

  private getAdminNewOrderTemplate(
    orderId: string,
    customerName: string,
    customerEmail: string,
    customerPhone: string,
    totalAmount: number,
    deliveryMethod: string,
    address?: string,
    city?: string,
    pincode?: string,
    items?: any[]
  ): EmailTemplate {
    const isPickup = deliveryMethod === 'PICKUP';
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Order - Admin Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #007bff; margin-bottom: 20px;">🛒 New Order Received</h2>
          <p>A new order has been placed on your store.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Total Amount:</strong> ₹${(totalAmount / 100).toFixed(2)}</p>
            <p><strong>Order Type:</strong> ${isPickup ? '🏪 Store Pickup' : '🚚 Home Delivery'}</p>
          </div>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Information:</h3>
            <p><strong>Name:</strong> ${customerName}</p>
            <p><strong>Email:</strong> ${customerEmail}</p>
            <p><strong>Phone:</strong> ${customerPhone}</p>
            ${!isPickup && address ? `
            <p><strong>Delivery Address:</strong><br>
            ${address}<br>
            ${city ? `${city}${pincode ? ` - ${pincode}` : ''}` : ''}</p>
            ` : ''}
          </div>
          
          ${items && items.length > 0 ? `
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Items Ordered:</h3>
            <ul style="list-style: none; padding: 0;">
              ${items.map(item => `
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  ${item.productName} × ${item.quantity} = ₹${(item.unitPrice * item.quantity / 100).toFixed(2)}
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
          
          <p style="margin-top: 20px;">Please process this order promptly.</p>
          <p><strong>TaYaima Store Admin</strong></p>
        </div>
      </body>
      </html>
    `;

    const text = `
New Order Received - TaYaima

A new order has been placed on your store.

Order Details:
Order ID: ${orderId}
Total Amount: ₹${(totalAmount / 100).toFixed(2)}
Order Type: ${isPickup ? 'Store Pickup' : 'Home Delivery'}

Customer Information:
Name: ${customerName}
Email: ${customerEmail}
Phone: ${customerPhone}
${!isPickup && address ? `Delivery Address: ${address}${city ? `, ${city}${pincode ? ` - ${pincode}` : ''}` : ''}` : ''}

${items && items.length > 0 ? `Items Ordered:\n${items.map(item => `- ${item.productName} × ${item.quantity} = ₹${(item.unitPrice * item.quantity / 100).toFixed(2)}`).join('\n')}` : ''}

Please process this order promptly.
    `;

    return {
      subject: `🛒 New Order #${orderId} - TaYaima`,
      html,
      text: text.trim()
    };
  }

  private getAdminOrderCancellationTemplate(
    orderId: string,
    customerName: string,
    totalAmount: number,
    cancellationReason?: string
  ): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Cancelled - Admin Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">❌ Order Cancelled</h2>
          <p>An order has been cancelled by the customer.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Total Amount:</strong> ₹${(totalAmount / 100).toFixed(2)}</p>
            ${cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>` : ''}
          </div>
          
          <p style="margin-top: 20px;">Please update your inventory and records accordingly.</p>
          <p><strong>TaYaima Store Admin</strong></p>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Cancelled - TaYaima

An order has been cancelled by the customer.

Order Details:
Order ID: ${orderId}
Customer: ${customerName}
Total Amount: ₹${(totalAmount / 100).toFixed(2)}
${cancellationReason ? `Cancellation Reason: ${cancellationReason}` : ''}

Please update your inventory and records accordingly.
    `;

    return {
      subject: `❌ Order Cancelled #${orderId} - TaYaima`,
      html,
      text: text.trim()
    };
  }

  private getAdminOrderDeliveredTemplate(
    orderId: string,
    customerName: string,
    totalAmount: number
  ): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered - Admin Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">✅ Order Delivered</h2>
          <p>An order has been successfully delivered.</p>
          
          <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderId}</p>
            <p><strong>Customer:</strong> ${customerName}</p>
            <p><strong>Total Amount:</strong> ₹${(totalAmount / 100).toFixed(2)}</p>
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">DELIVERED</span></p>
          </div>
          
          <p style="margin-top: 20px;">Transaction completed successfully!</p>
          <p><strong>TaYaima Store Admin</strong></p>
        </div>
      </body>
      </html>
    `;

    const text = `
Order Delivered - TaYaima

An order has been successfully delivered.

Order Details:
Order ID: ${orderId}
Customer: ${customerName}
Total Amount: ₹${(totalAmount / 100).toFixed(2)}
Status: DELIVERED

Transaction completed successfully!
    `;

    return {
      subject: `✅ Order Delivered #${orderId} - TaYaima`,
      html,
      text: text.trim()
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for external use
export type { EmailConfig, EmailTemplate };
