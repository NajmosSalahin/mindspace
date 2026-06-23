import axios from 'axios';

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: process.env.BREVO_FROM_EMAIL, name: process.env.BREVO_FROM_NAME },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      { headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' } }
    );
    console.log(`Email sent: ${res.data.messageId}`);
    return res.data;
  } catch (error) {
    console.error('Email send error:', error.response?.data || error.message);
    throw error;
  }
};

export const sendOTPEmail = async (email, otp) => {
  const html = `
    <div style="font-family:'DM Sans',sans-serif;background:#0A0F1E;padding:40px 20px;">
      <div style="max-width:480px;margin:auto;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
        <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:28px;margin:0 0 8px;">EventSphere</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 24px;">Verify your email address</p>
        <div style="text-align:center;padding:20px;background:rgba(79,70,229,0.1);border-radius:12px;border:1px solid rgba(79,70,229,0.3);">
          <p style="color:rgba(255,255,255,0.6);font-size:14px;margin:0 0 12px;">Your verification code</p>
          <h2 style="font-size:36px;letter-spacing:8px;color:#4F46E5;margin:0;">${otp}</h2>
        </div>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:24px;">This code expires in 10 minutes.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Verify your email - EventSphere', html });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family:'DM Sans',sans-serif;background:#0A0F1E;padding:40px 20px;">
      <div style="max-width:480px;margin:auto;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;text-align:center;">
        <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:28px;margin:0 0 8px;">Welcome, ${name}!</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;">You're now part of EventSphere. Discover amazing events and connect with people.</p>
        <a href="${process.env.CLIENT_URL}/events" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;">Explore Events</a>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Welcome to EventSphere!', html });
};

export const sendTicketConfirmationEmail = async (email, name, eventTitle, qrCodeData) => {
  const html = `
    <div style="font-family:'DM Sans',sans-serif;background:#0A0F1E;padding:40px 20px;">
      <div style="max-width:480px;margin:auto;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
        <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:24px;margin:0 0 8px;">Ticket Confirmed</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;">${eventTitle}</p>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;">Thank you ${name}, your ticket is confirmed. Show the QR code below at the event.</p>
        <div style="text-align:center;padding:20px;background:rgba(255,255,255,0.05);border-radius:12px;margin:16px 0;">
          <p style="color:rgba(255,255,255,0.4);font-size:12px;">QR Code: ${qrCodeData}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/dashboard/tickets" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;">View My Tickets</a>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `Ticket Confirmed - ${eventTitle}`, html });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family:'DM Sans',sans-serif;background:#0A0F1E;padding:40px 20px;">
      <div style="max-width:480px;margin:auto;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;text-align:center;">
        <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:24px;">Reset Your Password</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;">Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;margin-top:24px;padding:12px 32px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;">Reset Password</a>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Password Reset - EventSphere', html });
};

export const sendEventReminderEmail = async (email, name, eventTitle, eventDate, eventTime, venue) => {
  const html = `
    <div style="font-family:'DM Sans',sans-serif;background:#0A0F1E;padding:40px 20px;">
      <div style="max-width:480px;margin:auto;background:rgba(255,255,255,0.05);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
        <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:24px;">Reminder: ${eventTitle}</h1>
        <p style="color:rgba(255,255,255,0.6);font-size:14px;">Hi ${name}, your event starts in 24 hours!</p>
        <div style="padding:16px;background:rgba(79,70,229,0.1);border-radius:12px;margin:16px 0;">
          <p style="color:#fff;margin:4px 0;"><strong>Date:</strong> ${eventDate}</p>
          <p style="color:#fff;margin:4px 0;"><strong>Time:</strong> ${eventTime}</p>
          <p style="color:#fff;margin:4px 0;"><strong>Venue:</strong> ${venue}</p>
        </div>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `Reminder: ${eventTitle} starts soon!`, html });
};
