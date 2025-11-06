import axios from "axios";

class SendookAPI {
  private apiSecret: string;
  private apiUrl: string;

  constructor(apiSecret: string, apiUrl?: string) {
    this.apiSecret = apiSecret;
    this.apiUrl = apiUrl || "https://api.sendook.com/v1";
  }

  async createInbox({
    name,
    email,
  }: {
    name: string;
    email?: string;
  }) {
    const response = await axios.post(`${this.apiUrl}/inboxes`, {
      name,
      email,
    }, {
      headers: {
        "Authorization": `Bearer ${this.apiSecret}`,
      },
    });
    return response.data;
  }
}

export default SendookAPI;
