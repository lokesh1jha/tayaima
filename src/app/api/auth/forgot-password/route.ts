import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailService } from "@/lib/email";
import { logger } from "@/lib/logger";
import crypto from "crypto";
import { z } from "zod";

export const runtime = "nodejs";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    logger.api('POST', '/api/auth/forgot-password', undefined, { email });

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        name: true,
        passwordHash: true 
      }
    });

    // Always return success for security (don't reveal if email exists)
    // But only send email if user exists and has a password
    if (user && user.passwordHash) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date();
      resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 15); // 15 minutes from now

      // Save reset token to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Send reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || undefined
      );

      if (emailSent) {
        logger.info('Password reset email sent successfully', { 
          userId: user.id, 
          email: user.email 
        });
      } else {
        logger.error('Failed to send password reset email', null, { 
          userId: user.id, 
          email: user.email 
        });
        
        // Clean up the token if email failed
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: null,
            resetTokenExpiry: null,
          },
        });
      }
    } else {
      // Log attempt for non-existent user or OAuth user
      logger.warn('Password reset attempted for non-existent or OAuth user', { email });
    }

    // Always return success message for security
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we've sent you a password reset link.",
    });

  } catch (error) {
    logger.error('Error in forgot password API', error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
