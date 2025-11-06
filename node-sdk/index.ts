import axios from "axios";

class SendookAPI {
  private apiSecret: string;
  private apiUrl: string;

  constructor(apiSecret: string, apiUrl?: string) {
    this.apiSecret = apiSecret;
    this.apiUrl = apiUrl || "https://api.sendook.com";
  }

  public inbox = {
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
    }
  };
}

export default SendookAPI;
