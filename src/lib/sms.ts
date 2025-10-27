/**
 * TODO: SMS SERVICE - CURRENTLY DISABLED
 * 
 * This entire SMS service is commented out and not in use.
 * It handles sending OTPs and order notifications via SMS using Fast2SMS API.
 * 
 * Will be enabled later when SMS functionality is needed.
 */

import { z } from 'zod';

// Fast2SMS Configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID || 'TAYAIM';
const FAST2SMS_MESSAGE_TEMPLATE = process.env.FAST2SMS_MESSAGE_TEMPLATE || '111111'; // Default template ID

// Validation schemas
const phoneSchema = z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');

// SMS Response types
interface SmsResponse {
  return: boolean;
  request_id?: string;
  message: string[];
}

interface SmsError {
  return: false;
  status_code: number;
  message: string;
}

class SmsService {
  private apiKey: string;
  private senderId: string;
  private messageTemplate: string;

  constructor() {
    if (!FAST2SMS_API_KEY) {
      console.warn('FAST2SMS_API_KEY is not configured. SMS functionality will be disabled.');
    }
    this.apiKey = FAST2SMS_API_KEY || '';
    this.senderId = FAST2SMS_SENDER_ID;
    this.messageTemplate = FAST2SMS_MESSAGE_TEMPLATE;
  }

  /**
   * Send OTP SMS to phone number
   */
  async sendOtp(phone: string, otp: string): Promise<SmsResponse> {
    if (!this.apiKey) {
      throw new Error('SMS service not configured. Please set FAST2SMS_API_KEY.');
    }

    // Validate phone number
    const validatedPhone = phoneSchema.parse(phone);
    
    // Format phone number with country code
    const formattedPhone = `91${validatedPhone}`;

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', this.apiKey);
    url.searchParams.set('sender_id', this.senderId);
    url.searchParams.set('message', this.messageTemplate);
    url.searchParams.set('variables_values', otp);
    url.searchParams.set('route', 'dlt');
    url.searchParams.set('numbers', formattedPhone);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`SMS API Error: ${data.message || 'Unknown error'}`);
      }

      if (!data.return) {
        throw new Error(`SMS Failed: ${data.message || 'Unknown error'}`);
      }

      return data as SmsResponse;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  }

  /**
   * Send order confirmation SMS
   */
  async sendOrderConfirmation(phone: string, orderDetails: {
    orderId: string;
    totalAmount: number;
    items: string[];
    deliveryMethod?: string;
  }): Promise<SmsResponse> {
    if (!this.apiKey) {
      throw new Error('SMS service not configured. Please set FAST2SMS_API_KEY.');
    }

    const validatedPhone = phoneSchema.parse(phone);
    const formattedPhone = `91${validatedPhone}`;

    // Create order confirmation message with delivery method
    const deliveryInfo = orderDetails.deliveryMethod ? ` (${orderDetails.deliveryMethod})` : '';
    const message = `Order Confirmed! Order ID: ${orderDetails.orderId}${deliveryInfo}, Total: ₹${(orderDetails.totalAmount / 100).toFixed(2)}. Items: ${orderDetails.items.join(', ')}. Thank you for shopping with TaYaima Store!`;

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', this.apiKey);
    url.searchParams.set('sender_id', this.senderId);
    url.searchParams.set('message', message);
    url.searchParams.set('route', 'dlt');
    url.searchParams.set('numbers', formattedPhone);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`SMS API Error: ${data.message || 'Unknown error'}`);
      }

      if (!data.return) {
        throw new Error(`SMS Failed: ${data.message || 'Unknown error'}`);
      }

      return data as SmsResponse;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  }

  /**
   * Send delivery update SMS
   */
  async sendDeliveryUpdate(phone: string, orderId: string, status: string): Promise<SmsResponse> {
    if (!this.apiKey) {
      throw new Error('SMS service not configured. Please set FAST2SMS_API_KEY.');
    }

    const validatedPhone = phoneSchema.parse(phone);
    const formattedPhone = `91${validatedPhone}`;

    const message = `Order Update: Your order ${orderId} status is now ${status}. Thank you for shopping with TaYaima Store!`;

    const url = new URL('https://www.fast2sms.com/dev/bulkV2');
    url.searchParams.set('authorization', this.apiKey);
    url.searchParams.set('sender_id', this.senderId);
    url.searchParams.set('message', message);
    url.searchParams.set('route', 'dlt');
    url.searchParams.set('numbers', formattedPhone);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'cache-control': 'no-cache',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`SMS API Error: ${data.message || 'Unknown error'}`);
      }

      if (!data.return) {
        throw new Error(`SMS Failed: ${data.message || 'Unknown error'}`);
      }

      return data as SmsResponse;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhone(phone: string): boolean {
    try {
      phoneSchema.parse(phone);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format phone number for SMS
   */
  static formatPhone(phone: string): string {
    const validatedPhone = phoneSchema.parse(phone);
    return `91${validatedPhone}`;
  }
}

// Export singleton instance
export const smsService = new SmsService();
export { SmsService, phoneSchema };
export type { SmsResponse, SmsError };
