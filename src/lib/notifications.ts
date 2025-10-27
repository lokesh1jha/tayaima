import { prisma } from './prisma';
// TODO: SMS service - Commented out for now, will be enabled later
// import { smsService } from './sms';
import { emailService } from './email';
import { logger } from './logger';

interface OrderDetails {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  status: string;
  deliveryMethod?: string;
  address?: string;
  city?: string;
  pincode?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

interface NotificationResult {
  emailSent: boolean;
  smsSent: boolean;
  errors: string[];
}

class NotificationService {
  constructor() {
    // Email service is already a singleton
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(orderDetails: OrderDetails, userEmail?: string | null): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSent: false,
      smsSent: false,
      errors: [],
    };

    // Try to send email if user has email
    if (userEmail) {
      try {
        await emailService.sendOrderConfirmationEmail(
          userEmail,
          orderDetails.id,
          orderDetails.customerName,
          orderDetails.totalAmount,
          orderDetails.items,
          orderDetails.deliveryMethod,
          orderDetails.address,
          orderDetails.city,
          orderDetails.pincode
        );
        result.emailSent = true;
        logger.info(`Order confirmation email sent to ${userEmail} for order ${orderDetails.id}`);
      } catch (error) {
        const errorMsg = `Failed to send email to ${userEmail}: ${error}`;
        result.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // TODO: SMS notifications - Commented out for now, will be enabled later
    /*
    // Always try to send SMS as backup or primary notification
    try {
      const itemsText = orderDetails.items
        .map(item => `${item.productName} (${item.quantity})`)
        .join(', ');
      
      // Add pickup/delivery info to SMS
      const deliveryInfo = orderDetails.deliveryMethod === 'PICKUP' 
        ? 'PICKUP from store' 
        : 'HOME DELIVERY';
      
      await smsService.sendOrderConfirmation(orderDetails.phone, {
        orderId: orderDetails.id,
        totalAmount: orderDetails.totalAmount,
        items: [itemsText], // Simplified for SMS
        deliveryMethod: deliveryInfo,
      });
      
      result.smsSent = true;
      logger.info(`Order confirmation SMS sent to ${orderDetails.phone} for order ${orderDetails.id}`);
    } catch (error) {
      const errorMsg = `Failed to send SMS to ${orderDetails.phone}: ${error}`;
      result.errors.push(errorMsg);
      logger.error(errorMsg);
    }
    */

    return result;
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(orderDetails: OrderDetails, userEmail?: string | null): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSent: false,
      smsSent: false,
      errors: [],
    };

    // Try to send email if user has email
    if (userEmail) {
      try {
        await emailService.sendOrderStatusUpdateEmail(
          userEmail,
          orderDetails.id,
          orderDetails.customerName,
          orderDetails.status,
          orderDetails.items
        );
        result.emailSent = true;
        logger.info(`Order status update email sent to ${userEmail} for order ${orderDetails.id}`);
      } catch (error) {
        const errorMsg = `Failed to send email to ${userEmail}: ${error}`;
        result.errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    // TODO: SMS notifications - Commented out for now, will be enabled later
    /*
    // Always try to send SMS as backup or primary notification
    try {
      await smsService.sendDeliveryUpdate(orderDetails.phone, orderDetails.id, orderDetails.status);
      result.smsSent = true;
      logger.info(`Order status update SMS sent to ${orderDetails.phone} for order ${orderDetails.id}`);
    } catch (error) {
      const errorMsg = `Failed to send SMS to ${orderDetails.phone}: ${error}`;
      result.errors.push(errorMsg);
      logger.error(errorMsg);
    }
    */

    return result;
  }

  /**
   * Send notification based on user preferences and availability
   */
  async sendNotification(
    orderDetails: OrderDetails,
    userId?: string,
    type: 'confirmation' | 'status_update' = 'confirmation'
  ): Promise<NotificationResult> {
    let userEmail: string | null = null;

    // For pickup orders, the email is stored in the phone field
    if (orderDetails.deliveryMethod === 'PICKUP' && orderDetails.phone) {
      // Check if phone field contains an email (contains @)
      if (orderDetails.phone.includes('@')) {
        userEmail = orderDetails.phone;
      }
    }

    // If not a pickup order or email not found in phone field, get user email from database
    if (!userEmail && userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        userEmail = user?.email || null;
      } catch (error) {
        logger.error(`Failed to fetch user email for ${userId}:`, error);
      }
    }

    // Send appropriate notification based on type
    if (type === 'confirmation') {
      return this.sendOrderConfirmation(orderDetails, userEmail);
    } else {
      return this.sendOrderStatusUpdate(orderDetails, userEmail);
    }
  }

  /**
   * Send notification to all users (admin function)
   */
  async sendBulkNotification(
    message: string,
    phoneNumbers: string[],
    emails?: string[]
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      emailSent: false,
      smsSent: false,
      errors: [],
    };

    // TODO: SMS notifications - Commented out for now, will be enabled later
    /*
    // Send SMS to all phone numbers
    for (const phone of phoneNumbers) {
      try {
        await smsService.sendOrderConfirmation(phone, {
          orderId: 'BULK',
          totalAmount: 0,
          items: [message],
        });
        result.smsSent = true;
      } catch (error) {
        result.errors.push(`Failed to send SMS to ${phone}: ${error}`);
      }
    }
    */

    // Send email to all email addresses
    if (emails && emails.length > 0) {
      for (const email of emails) {
        try {
          // Bulk notification email method not implemented yet
          console.log(`Bulk notification to ${email}: ${message}`);
          result.emailSent = true;
        } catch (error) {
          result.errors.push(`Failed to send email to ${email}: ${error}`);
        }
      }
    }

    return result;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export { NotificationService };
export type { OrderDetails, NotificationResult };
