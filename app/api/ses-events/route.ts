import { dynamoDb } from "@/utils/aws-config";
import { TableNames } from "@/utils/dynamodb-schema";

interface SESNotification {
  eventType: string;
  mail: {
    messageId: string;
    destination: string[];
    tags: {
      name: string;
      value: string;
    }[];
  };
  bounce?: {
    bounceType: string;
    bounceSubType: string;
    bouncedRecipients: {
      emailAddress: string;
    }[];
  };
  complaint?: {
    complainedRecipients: {
      emailAddress: string;
    }[];
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Handle SNS subscription confirmation
    if (body.Type === 'SubscriptionConfirmation') {
      // You should verify the subscription by visiting the SubscribeURL
      console.log('SNS Subscription URL:', body.SubscribeURL);
      return new Response(null, { status: 200 });
    }

    // Parse the SES notification from the SNS message
    const notification: SESNotification = JSON.parse(body.Message);
    const { eventType, mail } = notification;

    // Get email type from message tags
    const emailType = mail.tags.find(tag => tag.name === 'emailType')?.value || 'unknown';

    // Update email tracking record
    await dynamoDb.update({
      TableName: TableNames.EMAIL_TRACKING!,
      Key: {
        email_id: mail.messageId,
        sent_at: new Date().toISOString(), // This should match the original sent_at
      },
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status"
      },
      ExpressionAttributeValues: {
        ":status": eventType.toLowerCase()
      }
    }).promise();

    // Handle bounces
    if (notification.bounce) {
      const { bounceType, bouncedRecipients } = notification.bounce;
      
      // Handle hard bounces for newsletter recipients
      if (bounceType === 'Permanent' && emailType === 'newsletter') {
        for (const recipient of bouncedRecipients) {
          await dynamoDb.update({
            TableName: TableNames.NEWSLETTER!,
            Key: { email: recipient.emailAddress },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":status": "unsubscribed"
            }
          }).promise();
        }
      }
    }

    // Handle complaints
    if (notification.complaint) {
      const { complainedRecipients } = notification.complaint;
      
      // Unsubscribe complained recipients from newsletter
      if (emailType === 'newsletter') {
        for (const recipient of complainedRecipients) {
          await dynamoDb.update({
            TableName: TableNames.NEWSLETTER!,
            Key: { email: recipient.emailAddress },
            UpdateExpression: "SET #status = :status",
            ExpressionAttributeNames: {
              "#status": "status"
            },
            ExpressionAttributeValues: {
              ":status": "unsubscribed"
            }
          }).promise();
        }
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error processing SES event:', error);
    return new Response(
      JSON.stringify({ error: "Failed to process event" }),
      { status: 500 }
    );
  }
} 