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
        to: "marc@rupt.dev",
        subject: "Test Subject",
        text: "Test Text",
        html: "<p>Test HTML</p>",
      });
      expect(message).toBeDefined();
    });
  });
});
