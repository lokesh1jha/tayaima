import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, generateOTPExpiry, validatePhoneNumber, normalizePhoneNumber } from "@/lib/otp";
import { z } from "zod";
import twilio from "twilio";

const sendOTPSchema = z.object({
  phone: z.string().min(10, "Phone number is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone } = sendOTPSchema.parse(body);

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Check if user exists, if not create a temporary record
    let user = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!user) {
      // Create a temporary user record for OTP verification
      user = await prisma.user.create({
        data: {
          phone: normalizedPhone,
          phoneOtp: otp,
          phoneOtpExpiry: otpExpiry,
        }
      });
    } else {
      // Update existing user with new OTP
      user = await prisma.user.update({
        where: { phone: normalizedPhone },
        data: {
          phoneOtp: otp,
          phoneOtpExpiry: otpExpiry,
        }
      });
    }

    // Send OTP via Twilio SMS
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
      return NextResponse.json(
        { error: "SMS service is not configured" },
        { status: 503 }
      );
    }

    const client = twilio(accountSid, authToken);

    const smsBody = `Your OTP for Kirana Store login is: ${otp}. It expires in 5 minutes.`;

    await client.messages.create({
      to: `+${normalizedPhone}`,
      body: smsBody,
      ...(messagingServiceSid ? { messagingServiceSid } : { from: fromNumber as string })
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully via SMS"
    });

  } catch (error: any) {
    console.error("Send OTP error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
