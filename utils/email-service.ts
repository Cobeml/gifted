import { SES } from 'aws-sdk';
import { NewsletterSubscriber } from './dynamodb-schema';
import { v4 as uuidv4 } from 'uuid';

// Initialize SES client
const ses = new SES({
  region: process.env.AWS_SES_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  isAuth?: boolean;
  metadata?: Record<string, any>;
}

export class EmailService {
  private static async trackEmail(options: EmailOptions, messageId: string) {
    const { to, subject, metadata } = options;
    const recipients = Array.isArray(to) ? to : [to];
    
    const trackingItems = recipients.map(recipient => ({
      email_id: messageId,
      recipient,
      subject,
      sent_at: new Date().toISOString(),
      status: 'sent',
      type: options.isAuth ? 'auth' : 'newsletter',
      metadata
    }));

    // TODO: Batch write to DynamoDB email-tracking table
  }

  static async sendEmail(options: EmailOptions) {
    const { to, subject, html, text, isAuth, metadata } = options;
    const messageId = uuidv4();
    
    const params = {
      Source: isAuth 
        ? `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_AUTH_FROM_EMAIL}>`
        : `${process.env.AWS_SES_FROM_NAME} <${process.env.AWS_SES_NEWSLETTER_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
      ConfigurationSetName: isAuth 
        ? process.env.AWS_SES_AUTH_CONFIG_SET 
        : process.env.AWS_SES_NEWSLETTER_CONFIG_SET
    };

    try {
      const result = await ses.sendEmail(params).promise();
      await this.trackEmail(options, messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  static async sendNewsletterWelcome(subscriber: NewsletterSubscriber) {
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
    
    return this.sendEmail({
      to: subscriber.email,
      subject: 'Welcome to Our Newsletter!',
      html: `
        <h1>Welcome to Our Newsletter!</h1>
        <p>Thank you for subscribing to our newsletter. We're excited to share updates with you!</p>
        <p>If you wish to unsubscribe, <a href="${unsubscribeUrl}">click here</a>.</p>
        <p>Best regards,<br>${process.env.AWS_SES_FROM_NAME}</p>
      `,
      text: `Welcome to Our Newsletter!\n\nThank you for subscribing to our newsletter. We're excited to share updates with you!\n\nTo unsubscribe, visit: ${unsubscribeUrl}\n\nBest regards,\n${process.env.AWS_SES_FROM_NAME}`,
      metadata: {
        type: 'welcome',
        subscribedAt: subscriber.subscribed_at
      }
    });
  }

  static async sendAuthEmail(to: string, subject: string, html: string, text?: string) {
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      isAuth: true,
      metadata: {
        type: 'auth'
      }
    });
  }

  static async sendNewsletterVerification(subscriber: NewsletterSubscriber) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/newsletter/verify?token=${subscriber.verification_token}&email=${encodeURIComponent(subscriber.email)}`;
    
    return this.sendEmail({
      to: subscriber.email,
      subject: 'Verify your newsletter subscription',
      html: `
        <h1>Verify your email address</h1>
        <p>Thank you for subscribing to our newsletter! Please click the button below to verify your email address:</p>
        <div style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
        <p>If you didn't request this verification, you can safely ignore this email.</p>
        <p>Best regards,<br>${process.env.AWS_SES_FROM_NAME}</p>
      `,
      text: `
        Verify your email address

        Thank you for subscribing to our newsletter! Please visit the following URL to verify your email address:

        ${verificationUrl}

        If you didn't request this verification, you can safely ignore this email.

        Best regards,
        ${process.env.AWS_SES_FROM_NAME}
      `,
      metadata: {
        type: 'verification',
        subscribedAt: subscriber.subscribed_at
      }
    });
  }
} 