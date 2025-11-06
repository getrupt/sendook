import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
dotenv.config();
// @ts-ignore
import { expect, describe, it } from "bun:test";
import Sendook from "../index";

describe("SendookAPI", function () {
  describe("createInbox", function () {
    it("should create an inbox", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const name = faker.person.fullName();
      const inbox = await sendook.inbox.create({
        name,
      });
      expect(inbox).toBeDefined();
      expect(inbox.name).toBe(name);
      expect(inbox.email).toBeDefined();
    });
  });
  describe("getInboxes", function () {
    it("should get inboxes", async function () {
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const inboxes = await sendook.inbox.list();
      console.log("inboxes", inboxes);
      expect(inboxes).toBeDefined();
      expect(inboxes.length).toBeGreaterThan(0);
    });
  });
});
