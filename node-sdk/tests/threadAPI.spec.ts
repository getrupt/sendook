import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
dotenv.config();
// @ts-ignore
import { expect, describe, it } from "bun:test";
import Sendook from "../index";

describe("ThreadAPI", function () {
  describe("listThreads", function () {
    it("should list threads", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const threads = await sendook.inbox.thread.list(newInbox.id);
      expect(threads).toBeDefined();
      expect(threads.length).toBeGreaterThan(0);
    });
  });
  describe("getThread", function () {
    it("should get a thread", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const newMessage = await sendook.inbox.message.send({
        inboxId: newInbox._id,
        to: "marc@rupt.dev",
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      const thread = await sendook.inbox.thread.get(newInbox._id, newMessage.threadId);
      expect(thread).toBeDefined();
      expect(thread._id).toBe(newMessage.threadId);
    });
  });
});
