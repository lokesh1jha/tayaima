import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Email to admin
    const adminMailOptions = {
      from: "tayaima.com@gmail.com",
      to: "tayaima.com@gmail.com",
      subject: `Contact Form: ${subject || 'New Inquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32; border-bottom: 2px solid #2E7D32; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            ${phone ? `<p style="margin: 10px 0;"><strong>Phone:</strong> ${phone}</p>` : ''}
            ${subject ? `<p style="margin: 10px 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <h3 style="color: #333;">Message:</h3>
          <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #2E7D32; margin: 10px 0;">
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #777; font-size: 12px;">
            This email was sent from the TaYaima Store contact form.
          </p>
        </div>
      `,
    };

    // Confirmation email to user
    const userMailOptions = {
      from: "tayaima.com@gmail.com",
      to: email,
      subject: 'Thank you for contacting TaYaima Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E7D32;">Thank You for Reaching Out!</h2>
          
          <p style="line-height: 1.6; color: #555;">
            Dear ${name},
          </p>
          
          <p style="line-height: 1.6; color: #555;">
            Thank you for contacting TaYaima Store. We have received your message and will get back to you as soon as possible.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message:</h3>
            <p style="line-height: 1.6; color: #555;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p style="line-height: 1.6; color: #555;">
            For urgent inquiries, you can also reach us on WhatsApp at <strong>+91 8837284911</strong>.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <div style="text-align: center; color: #777;">
            <p style="margin: 5px 0;"><strong>TaYaima Store</strong></p>
            <p style="margin: 5px 0;">Your trusted family store from Manipur</p>
            <p style="margin: 5px 0; font-size: 12px;">www.tayaima.com</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

