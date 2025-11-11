import dotenv from "dotenv";
dotenv.config();
// @ts-ignore
import { expect, beforeAll, afterAll, describe, it } from "bun:test";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { register } from "../controllers/AuthController";
import { createMessage } from "../controllers/MessageController";
import { createInbox, getNewRandomInboxEmail } from "../controllers/InboxController";
import { sendSESMessage } from "../controllers/SESController";
import { createThread } from "../controllers/ThreadController";

describe("MessageController", function () {
  beforeAll(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async function () {
    await mongoose.disconnect();
  });
  describe("createMessage", function () {
    it("should create and send a message", async function () {
      const { organization, apiKey } = await register(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.internet.password()
      );
      const toEmail = "marc@rupt.dev";
      const name = faker.person.fullName();
      const inbox = await createInbox({
        organization_id: organization.id,
        name,
      });
      const thread = await createThread({
        organizationId: organization.id,
        inboxId: inbox.id,
      });
      const subject = faker.lorem.sentence();
      const text = faker.lorem.paragraph();
      const html = `<p>${text}</p>`;
      const message = await createMessage({
        organizationId: organization.id,
        inboxId: inbox.id,
        threadId: thread.id,
        fromInboxId: inbox.id,
        from: inbox.email,
        to: [toEmail],
        subject,
        text,
        html,
      });
      expect(message).toBeDefined();
      expect(message.organizationId.toString()).toBe(organization.id);
      expect(message.inboxId.toString()).toBe(inbox.id);
      expect(message.from).toBe(inbox.email);
      expect(message.to).toBe(toEmail);
      expect(message.subject).toBe(subject);
      expect(message.text).toBe(text);
      expect(message.html).toBe(html);
      await sendSESMessage({
        messageId: message.id,
        from: inbox.email,
        fromName: inbox.name,
        to: [toEmail],
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      expect(message.status).toBeUndefined();
    });
  });
});
