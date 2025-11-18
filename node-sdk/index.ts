import axios from "axios";
import type {
  ApiKeyMethods,
  DomainMethods,
  InboxMethods,
  CreateApiKeyParams,
  GetApiKeyParams,
  DeleteApiKeyParams,
  CreateDomainParams,
  GetDomainParams,
  VerifyDomainParams,
  DeleteDomainParams,
  CreateInboxParams,
  SendMessageParams,
  ReplyMessageParams,
  WebhookMethods,
} from "./types/sendook-api";

class SendookAPI {
  private apiSecret: string;
  private apiUrl: string;

  constructor(apiSecret: string, apiUrl?: string) {
    this.apiSecret = apiSecret;
    this.apiUrl = apiUrl || "https://api.sendook.com";
  }

  public apiKey: ApiKeyMethods = {
    create: async ({
      name,
    }: {
      name: string;
    }) => {
      const response = await axios.post(`${this.apiUrl}/v1/api_keys`, {
        name,
      }, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    list: async () => {
      const response = await axios.get(`${this.apiUrl}/v1/api_keys`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    get: async ({
      apiKeyId,
    }: {
      apiKeyId: string;
    }) => {
      const response = await axios.get(`${this.apiUrl}/v1/api_keys/${apiKeyId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    delete: async ({
      apiKeyId,
    }: {
      apiKeyId: string;
    }) => {
      const response = await axios.delete(`${this.apiUrl}/v1/api_keys/${apiKeyId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
  };

  public domain: DomainMethods = {
    create: async ({
      name,
    }: {
      name: string;
    }) => {
      const response = await axios.post(`${this.apiUrl}/v1/domains`, {
        name,
      }, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    get: async ({
      domainId,
    }: {
      domainId: string;
    }) => {
      const response = await axios.get(`${this.apiUrl}/v1/domains/${domainId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    verify: async ({
      domainId,
    }: {
      domainId: string;
    }) => {
      const response = await axios.post(`${this.apiUrl}/v1/domains/${domainId}/verify`, {}, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    dns: async ({
      domainId,
    }: {
      domainId: string;
    }) => {
      const response = await axios.get(`${this.apiUrl}/v1/domains/${domainId}/dns`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    delete: async ({
      domainId,
    }: {
      domainId: string;
    }) => {
      const response = await axios.delete(`${this.apiUrl}/v1/domains/${domainId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
  };

  public inbox: InboxMethods = {
    create: async ({
      name,
      email,
    }: {
      name: string;
      email?: string;
    }) => {
      const response = await axios.post(`${this.apiUrl}/v1/inboxes`, {
        name,
        email,
      }, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    list: async () => {
      const response = await axios.get(`${this.apiUrl}/v1/inboxes`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    get: async (inboxId: string) => {
      const response = await axios.get(`${this.apiUrl}/v1/inboxes/${inboxId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    delete: async (inboxId: string) => {
      const response = await axios.delete(`${this.apiUrl}/v1/inboxes/${inboxId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    message: {
      send: async ({
        inboxId,
        to,
        cc,
        bcc,
        labels,
        subject,
        text,
        html,
      }: {
        inboxId: string;
        to: string[];
        cc?: string[];
        bcc?: string[];
        labels?: string[];
        subject: string;
        text: string;
        html: string;
      }) => {
        const response = await axios.post(`${this.apiUrl}/v1/inboxes/${inboxId}/messages/send`, {
          to,
          cc,
          bcc,
          labels,
          subject,
          text,
          html,
        }, {
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
      reply: async ({
        inboxId,
        messageId,
        text,
        html,
      }: {
        inboxId: string;
        messageId: string;
        text: string;
        html: string;
      }) => {
        const response = await axios.post(`${this.apiUrl}/v1/inboxes/${inboxId}/messages/${messageId}/reply`, {
          text,
          html,
        }, {
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
      list: async (inboxId: string, query?: string) => {
        const response = await axios.get(`${this.apiUrl}/v1/inboxes/${inboxId}/messages`, {
          params: {
            query,
          },
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
      get: async (inboxId: string, messageId: string) => {
        const response = await axios.get(`${this.apiUrl}/v1/inboxes/${inboxId}/messages/${messageId}`, {
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
    },
    thread: {
      list: async (inboxId: string) => {
        const response = await axios.get(`${this.apiUrl}/v1/inboxes/${inboxId}/threads`, {
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
      get: async (inboxId: string, threadId: string) => {
        const response = await axios.get(`${this.apiUrl}/v1/inboxes/${inboxId}/threads/${threadId}`, {
          headers: {
            "Authorization": `Bearer ${this.apiSecret}`,
          },
        });
        return response.data;
      },
    },
  };

  public webhook: WebhookMethods = {
    list: async () => {
      const response = await axios.get(`${this.apiUrl}/v1/webhooks`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    create: async ({
      url,
      events,
    }: {
      url: string;
      events: string[];
    }) => {
      const response = await axios.post(`${this.apiUrl}/v1/webhooks`, {
        url,
        events,
      }, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    test: async (webhookId: string) => {
      const response = await axios.post(`${this.apiUrl}/v1/webhooks/${webhookId}/test`, {}, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    get: async (webhookId: string) => {
      const response = await axios.get(`${this.apiUrl}/v1/webhooks/${webhookId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
    delete: async (webhookId: string) => {
      const response = await axios.delete(`${this.apiUrl}/v1/webhooks/${webhookId}`, {
        headers: {
          "Authorization": `Bearer ${this.apiSecret}`,
        },
      });
      return response.data;
    },
  };

}

export default SendookAPI;
