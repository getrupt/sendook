import {
  GetIdentityDkimAttributesCommand,
  SendRawEmailCommand,
  SESClient,
  VerifyDomainDkimCommand,
} from "@aws-sdk/client-ses";
import MailComposer from "nodemailer/lib/mail-composer";
import type { SNSMessage } from "../models/SES";
import { createMessage, getMessageByExternalMessageId, getMessageById } from "./MessageController";
import type { MessageStatus } from "../models/Message";
import type { WebhookEvents } from "../models/Webhook";
import { sendWebhookEvent } from "./WebhookAttemptController";
import { getInboxByEmail } from "./InboxController";
import { simpleParser } from "mailparser";
import EmailReplyParser from "email-reply-parser";
import { addMessageToThread, createThread } from "./ThreadController";

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
  cc,
  bcc,
  subject,
  text,
  html,
  attachments,
}: {
  messageId: string;
  from: string;
  fromName?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text: string;
  html: string;
  attachments?: {
    content: string;
    name?: string;
    contentType?: string;
  }[];
}) {
  // SES SendEmailCommand does NOT support attachments. To include attachments, you must use SendRawEmailCommand and manually build a MIME-encoded message.
  // Here's one way to do it with attachments:

  // Create the MIME message using nodemailer's MailComposer
  const mailOptions: any = {
    from: fromName ? `"${fromName}" <${from}>` : from,
    to: (to ?? []).join(", "),
    cc: (cc ?? []).join(", "),
    bcc: (bcc ?? []).join(", "),
    subject,
    text,
    html,
    attachments: (attachments ?? []).map(att => ({
      filename: att.name,
      content: att.content,
      contentType: att.contentType,
      encoding: "base64",
    })),
    headers: {
      "X-SES-CONFIGURATION-SET": "sendook-config-set",
      "X-SES-MESSAGE-TAGS": `message=${messageId}`,
    },
  };

  const composer = new MailComposer(mailOptions);
  const mimeMessage = await new Promise<Buffer>((resolve, reject) => {
    composer.compile().build((err, message) => {
      if (err) return reject(err);
      resolve(message);
    });
  });

  const command = new SendRawEmailCommand({
    RawMessage: { Data: mimeMessage },
    Tags: [
      {
        Name: "message",
        Value: messageId,
      },
    ],
  });
  return await ses.send(command);
}

export async function handleDeliveryNotification(rawMessage: string) {
  try {
    const notification: SNSMessage = JSON.parse(rawMessage);
    console.log("notification", notification);

    const messageId = notification.mail?.tags?.["message"]?.[0];
    if (messageId) {
      await handleOutboundSESMessage({
        notification,
        messageId,
      });
      return;
    }

    await handleInboundSESMessage({
      notification,
    });
  } catch (error) {
    console.error("Error handling SES delivery notification", error);
    return;
  }
}

export async function handleInboundSESMessage({
  notification,
}: {
  notification: SNSMessage;
}) {
  if (!notification.mail.destination[0]) {
    return;
  }

  const inbox = await getInboxByEmail(notification.mail.destination[0]);
  if (!inbox) {
    console.error("Inbox not found", notification.mail.destination[0]);
    return;
  }

  const mail = await simpleParser(Buffer.from(notification.content, "base64").toString("utf-8"));
  const content = new EmailReplyParser().read(mail.text ?? "");

  const fromInboxId = await getInboxByEmail(notification.mail.source);

  const reference = notification.mail.headers?.find(header => header.name === "References")?.value;
  const replyToMessageId = reference?.match(/<([^@>]+)@us-east-2\.amazonses\.com>/)?.[1];

  let threadId: string | undefined;
  if (replyToMessageId) {
    const message = await getMessageByExternalMessageId(replyToMessageId);
    if (message) {
      threadId = message.threadId.toString();
    }
  }

  if (!threadId) {
    const thread = await createThread({
      organizationId: inbox.organizationId.toString(),
      inboxId: inbox.id,
    });
    threadId = thread._id.toString();
  }

  const message = await createMessage({
    organizationId: inbox.organizationId.toString(),
    inboxId: inbox.id,
    threadId,
    from: notification.mail.source,
    fromInboxId: fromInboxId?.id,
    to: [notification.mail.destination[0]],
    toInboxId: inbox.id,
    subject: notification.mail.commonHeaders?.subject,
    text: content.getVisibleText(),
    html: content.getVisibleText(),
    status: "received",
  });

  await addMessageToThread({
    threadId,
    messageId: message._id.toString(),
  });

  await sendWebhookEvent({
    organizationId: inbox.organizationId.toString(),
    inboxId: inbox.id,
    messageId: message.id,
    event: "message.received",
    payload: message,
  });
}

export async function handleOutboundSESMessage({
  notification,
  messageId,
}: {
  notification: SNSMessage;
  messageId: string;
}) {
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

  if (status) {
    message.status = status;
    await message.save();
  }

  if (!event) {
    return;
  }

  await sendWebhookEvent({
    organizationId: message.organizationId.toString(),
    inboxId: message.inboxId.toString(),
    messageId: message.id,
    event,
    payload: message,
  });
}
