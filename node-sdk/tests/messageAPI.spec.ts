import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
dotenv.config();
// @ts-ignore
import { expect, describe, it } from "bun:test";
import Sendook from "../index";

describe("MessageAPI", function () {
  describe("sendMessage", function () {
    it("should send a message", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const message = await sendook.inbox.message.send({
        inboxId: newInbox._id,
        to: ["marc@rupt.dev"],
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      expect(message).toBeDefined();
    });
  });
  describe("listMessages", function () {
    it("should list messages", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const newMessage = await sendook.inbox.message.send({
        inboxId: newInbox._id,
        to: ["marc@rupt.dev"],
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      const messages = await sendook.inbox.message.list(newInbox._id);
      expect(messages).toBeDefined();
      expect(messages.length).toBeGreaterThan(0);
    });
  });
  describe("getMessage", function () {
    it("should get a message", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const newMessage = await sendook.inbox.message.send({
        inboxId: newInbox._id,
        to: ["marc@rupt.dev"],
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      const message = await sendook.inbox.message.get(newInbox._id, newMessage._id);
      expect(message).toBeDefined();
      expect(message._id).toBe(newMessage._id);
    });
  });
  describe("replyToMessage", function () {
    it("should reply to a message", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const newInbox = await sendook.inbox.create({
        name,
      });
      const newMessage = await sendook.inbox.message.send({
        inboxId: newInbox._id,
        to: ["marc@rupt.dev"],
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      const replyMessage = await sendook.inbox.message.reply({
        inboxId: newInbox._id,
        messageId: newMessage._id,
        text: "Test Reply Text",
        html: "<p>Test Reply HTML</p>",
      });
      expect(replyMessage).toBeDefined();
      expect(replyMessage.subject).toBe(`Re: ${newMessage.subject}`);
      expect(replyMessage.text).toBe("Test Reply Text");
      expect(replyMessage.html).toBe("<p>Test Reply HTML</p>");
    });
  });
});
