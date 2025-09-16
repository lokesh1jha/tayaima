import nodemailer from 'nodemailer';
import { logger } from './logger';

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
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for external use
export type { EmailConfig, EmailTemplate };
