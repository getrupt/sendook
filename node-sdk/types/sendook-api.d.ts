/**
 * Type definitions for SendookAPI
 */

export interface CreateWebhookParams {
  url: string;
  events: string[];
}

export interface GetWebhookParams {
  webhookId: string;
}

export interface DeleteWebhookParams {
  webhookId: string;
}

export interface CreateApiKeyParams {
  name: string;
}

export interface GetApiKeyParams {
  apiKeyId: string;
}

export interface DeleteApiKeyParams {
  apiKeyId: string;
}

export interface CreateDomainParams {
  name: string;
}

export interface GetDomainParams {
  domainId: string;
}

export interface VerifyDomainParams {
  domainId: string;
}

export interface GetDomainDNSParams {
  domainId: string;
}

export interface DeleteDomainParams {
  domainId: string;
}

export interface CreateInboxParams {
  name: string;
  email?: string;
}

export interface SendMessageParams {
  inboxId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  labels?: string[];
  subject: string;
  text: string;
  html: string;
}

export interface ReplyMessageParams {
  inboxId: string;
  messageId: string;
  text: string;
  html: string;
}

export interface ApiKeyMethods {
  create: (params: CreateApiKeyParams) => Promise<any>;
  list: () => Promise<any>;
  get: (params: GetApiKeyParams) => Promise<any>;
  delete: (params: DeleteApiKeyParams) => Promise<any>;
}

export interface DomainMethods {
  create: (params: CreateDomainParams) => Promise<any>;
  get: (params: GetDomainParams) => Promise<any>;
  verify: (params: VerifyDomainParams) => Promise<any>;
  dns: (params: GetDomainDNSParams) => Promise<any>;
  delete: (params: DeleteDomainParams) => Promise<any>;
}

export interface MessageMethods {
  send: (params: SendMessageParams) => Promise<any>;
  reply: (params: ReplyMessageParams) => Promise<any>;
  list: (inboxId: string, query?: string) => Promise<any>;
  get: (inboxId: string, messageId: string) => Promise<any>;
}

export interface ThreadMethods {
  list: (inboxId: string) => Promise<any>;
  get: (inboxId: string, threadId: string) => Promise<any>;
}

export interface InboxMethods {
  create: (params: CreateInboxParams) => Promise<any>;
  list: () => Promise<any>;
  get: (inboxId: string) => Promise<any>;
  delete: (inboxId: string) => Promise<any>;
  message: MessageMethods;
  thread: ThreadMethods;
}

export interface WebhookMethods {
  list: () => Promise<any>;
  create: (params: CreateWebhookParams) => Promise<any>;
  get: (webhookId: string) => Promise<any>;
  delete: (webhookId: string) => Promise<any>;
}
