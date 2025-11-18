import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
dotenv.config();
// @ts-ignore
import { expect, describe, it } from "bun:test";
import Sendook from "../index";

describe("WebhookAPI", function () {
  describe("createWebhook", function () {
    it("should create a webhook", async function () {
      const url = faker.internet.url();
      const events = ["message.received"];
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const webhook = await sendook.webhook.create({
        url,
        events,
      });
      expect(webhook).toBeDefined();
      expect(webhook.url).toBe(url);
      expect(webhook.events[0]).toBe(events[0]);
    });
  });
  describe("getWebhook", function () {
    it("should get a webhook", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const newWebhook = await sendook.webhook.create({
        url: faker.internet.url(),
        events: ["message.received"],
      });
      const webhook = await sendook.webhook.get(newWebhook._id);
      expect(webhook).toBeDefined();
      expect(webhook._id).toBe(newWebhook._id);
    });
  });
  describe("testWebhook", function () {
    it("should test a webhook", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const newWebhook = await sendook.webhook.create({
        url: "http://localhost:8006/webhooks/test",
        events: ["message.received"],
      });
      const testWebhook = await sendook.webhook.test(newWebhook._id);
      expect(testWebhook).toBeDefined();
    });
  });
  describe("deleteWebhook", function () {
    it("should delete a webhook", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const newWebhook = await sendook.webhook.create({
        url: faker.internet.url(),
        events: ["message.received"],
      });
      const deletedWebhook = await sendook.webhook.delete(newWebhook._id);
      expect(deletedWebhook).toBeDefined();
      expect(deletedWebhook._id).toBe(newWebhook._id)
    });;
  });
  describe("listWebhooks", function () {
    it("should list webhooks", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const webhooks = await sendook.webhook.list();
      expect(webhooks).toBeDefined();
      expect(webhooks.length).toBeGreaterThan(0);
    });
  });
});
