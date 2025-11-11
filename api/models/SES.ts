// Complaint, Delivery, Send, Reject, Open, Click, Rendering Failure, DeliveryDelay, or Subscription
export type NotificationType =
  | "Bounce"
  | "Complaint"
  | "Delivery"
  | "Send"
  | "Reject"
  | "Open"
  | "Click"
  | "Rendering Failure"
  | "DeliveryDelay"
  | "Subscription";

export type BounceType = "Permanent" | "Transient" | "Undetermined";
export type BounceSubType = {
  Permanent: "General" | "NoEmail" | "Suppressed" | "OnAccountSuppressionList";
  Transient:
    | "General"
    | "MailboxFull"
    | "MessageTooLarge"
    | "ContentRejected"
    | "AttachmentRejected";
  Undetermined: "Undetermined";
};

export type BouncedRecipient = {
  status: string;
  action: string;
  diagnosticCode?: string;
  emailAddress: string;
};

export type SNSMessageBounce<T extends BounceType> = {
  bounceType: T;
  bounceSubType: BounceSubType[T];
  bouncedRecipients: BouncedRecipient[];
  remoteMtaIp?: string;
  reportingMTA?: string;
  timestamp?: string;
  feedbackId?: string;
};

export type ComplainedRecipient = {
  emailAddress: string;
};

export type SNSMessageComplaint = {
  complainedRecipients: ComplainedRecipient[];
  timestamp: string;
  feedbackId: string;
  complaintSubType: "OnAccountSuppressionList" | null;
  userAgent?: string;
  complaintFeedbackType?:
    | "abuse"
    | "auth-failure"
    | "fraud"
    | "not-spam"
    | "other"
    | "virus"
    | string;
  arrivalDate?: string;
};

export type SNSMessageDelivery = {
  timestamp: string;
  processingTimeMillis: number;
  recipients: string[];
  smtpResponse: string;
  reportingMTA: string;
  remoteMtaIp: string;
};

export type SNSMessageMailHeader = {
  name: string;
  value: string;
};

export type SNSMessageMail = {
  destination: string[];
  headersTruncated: boolean;
  timestamp: string;
  messageId: string;
  source: string;
  sourceArn: string;
  sourceIp: string;
  sendingAccountId: string;
  commonHeaders?: Record<string, any>;
  headers?: SNSMessageMailHeader[];
  tags?: Record<string, string[]>;
};

export type SNSMessage = {
  notificationType?: NotificationType;
  eventType?: NotificationType;
  mail: SNSMessageMail;
  bounce?: SNSMessageBounce<BounceType>;
  complaint?: SNSMessageComplaint;
  delivery?: SNSMessageDelivery;
  reject?: any;
  failure?: any;
  deliveryDelay?: any;
  content: string;
};
