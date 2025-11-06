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
      const inbox = await sendook.createInbox({
        name,
      });
      expect(inbox).toBeDefined();
      expect(inbox.name).toBe(name);
      expect(inbox.email).toBeDefined();
    });
  });
});
