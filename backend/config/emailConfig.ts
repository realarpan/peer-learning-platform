/**
 * Email Configuration Module
 * Handles SMTP configuration for session invitations and notifications
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailConfig {
  service: string;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

const emailConfig: EmailConfig = {
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

// Create transporter instance
const transporter = nodemailer.createTransport(emailConfig);

/**
 * Send session invitation email
 * @param recipientEmail - Email address of the recipient
 * @param sessionDetails - Details of the session being invited to
 */
export const sendSessionInvitation = async (
  recipientEmail: string,
  sessionDetails: {
    sessionId: string;
    sessionName: string;
    instructorName: string;
    scheduledTime: Date;
    joinLink: string;
  }
) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@peerlearning.com',
      to: recipientEmail,
      subject: `Invitation: ${sessionDetails.sessionName}`,
      html: `
        <h2>You're invited to a peer learning session!</h2>
        <p><strong>Session:</strong> ${sessionDetails.sessionName}</p>
        <p><strong>Instructor:</strong> ${sessionDetails.instructorName}</p>
        <p><strong>Scheduled Time:</strong> ${sessionDetails.scheduledTime.toLocaleString()}</p>
        <a href="${sessionDetails.joinLink}">Join Session</a>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email to ${recipientEmail}`);
  }
};

export default transporter;
