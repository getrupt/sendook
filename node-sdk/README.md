# node-sdk

To install dependencies:

```bash
bun install
```

To test:

```bash
bun test
```

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

Usage:

To get started, you need to create an account in the Sendook dashboard and get your API key.

```env
SENDOOK_API_KEY=your_api_key
```

```ts
import Sendook from "@sendook/node";

const sendook = new Sendook(process.env.SENDOOK_API_KEY);

const inbox = await sendook.inbox.create({
  name: "My Inbox",
});

const messages = await sendook.inbox.message.send({
  inboxId: inbox._id,
  to: ["your@email.com"],
  subject: "Test Subject",
  text: "Test Text",
  html: "<p>Test HTML</p>",
});
```
