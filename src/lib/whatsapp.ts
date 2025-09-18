import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

class WhatsAppService {
  private client: Client | null = null;
  private isReady = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "whatsapp-otp-service"
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    this.client.on('qr', (qr) => {
      console.log('WhatsApp QR Code:');
      qrcode.generate(qr, { small: true });
      console.log('Scan the QR code above with WhatsApp to authenticate');
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
    });

    this.client.on('auth_failure', (msg) => {
      console.error('WhatsApp authentication failed:', msg);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    this.client.initialize();
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    if (!this.client || !this.isReady) {
      console.error('WhatsApp client is not ready');
      return false;
    }

    try {
      // Format phone number (remove any non-digits and add country code if needed)
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      
      const message = `Your OTP for Kirana Store login is: *${otp}*\n\nThis OTP will expire in 5 minutes.\n\nDo not share this OTP with anyone.`;
      
      await this.client.sendMessage(`${formattedNumber}@c.us`, message);
      console.log(`OTP sent successfully to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it starts with 0, remove it (for Indian numbers)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    // If it doesn't start with country code, add India's country code (91)
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  async isClientReady(): Promise<boolean> {
    return this.isReady;
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
    }
  }
}

// Singleton instance
let whatsappService: WhatsAppService | null = null;

export const getWhatsAppService = (): WhatsAppService => {
  if (!whatsappService) {
    whatsappService = new WhatsAppService();
  }
  return whatsappService;
};

export default WhatsAppService;
