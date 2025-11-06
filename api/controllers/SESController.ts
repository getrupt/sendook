import {
  GetIdentityDkimAttributesCommand,
  SendEmailCommand,
  SESClient,
  VerifyDomainDkimCommand,
} from "@aws-sdk/client-ses";
import type { SNSMessage } from "../models/SES";
import { getMessageById } from "./MessageController";
import type { MessageStatus } from "../models/Message";
import type { WebhookEvents } from "../models/Webhook";
import { sendWebhookEvent } from "./WebhookAttemptController";

export const ses = new SESClient({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
});

export async function verifyEmailDomain({ domain }: { domain: string }) {
  const command = new VerifyDomainDkimCommand({ Domain: domain });
  return await ses.send(command);
}

export async function domainVerificationStatus({ domain }: { domain: string }) {
  return await ses.send(
    new GetIdentityDkimAttributesCommand({ Identities: [domain] })
  );
}

export async function sendSESMessage({
  messageId,
  from,
  fromName,
  to,
  subject,
  text,
  html,
}: {
  messageId: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  console.log("Sending SES message", { messageId, from, to, fromName, subject, text, html });
  const command = new SendEmailCommand({
    Source: fromName ? `${fromName} <${from}>` : from,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: html,
          Charset: "UTF-8",
        },
        Text: {
          Data: text,
          Charset: "UTF-8",
        },
      },
    },
    Tags: [
      {
        Name: "message",
        Value: messageId,
      },
    ],
    ConfigurationSetName: "sendook-config-set",
  });
  return await ses.send(command);
}

export async function handleDeliveryNotification(rawMessage: string) {
  try {
    const notification: SNSMessage = JSON.parse(rawMessage);

    const messageId = notification.mail?.tags?.["message"]?.[0];
    if (!messageId) {
      console.error(
        "No sendook:message tag found in SES delivery notification"
      );
      return;
    }
    const message = await getMessageById(messageId);
    if (!message) {
      console.error("Message not found", messageId);
      return;
    }

    let status: (typeof MessageStatus)[number] | undefined;
    let event: (typeof WebhookEvents)[number] | undefined;
    if (notification.eventType === "Reject") {
      status = "rejected";
      event = "message.rejected";
    } else if (notification.eventType === "Bounce") {
      status = "bounced";
      event = "message.bounced";
    } else if (notification.eventType === "Complaint") {
      status = "complained";
      event = "message.complained";
    } else if (notification.eventType === "Delivery") {
      status = "delivered";
      event = "message.delivered";
    }

    message.status = status;
    await message.save();

    if (event) {
      await sendWebhookEvent({
        organizationId: message.organizationId.toString(),
        inboxId: message.inboxId.toString(),
        messageId: message.id,
        event,
        payload: message,
      });
    }
  } catch (error) {
    console.error("Error handling SES delivery notification", error);
    return;
  }
}
