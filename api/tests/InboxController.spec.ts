import dotenv from "dotenv";
dotenv.config();
// @ts-ignore
import { expect, beforeAll, afterAll, describe, it } from "bun:test";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { register } from "../controllers/AuthController";
import { createInbox } from "../controllers/InboxController";

describe("InboxController", function () {
  beforeAll(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async function () {
    await mongoose.disconnect();
  });
  describe("createInbox", function () {
    it("should create an inbox with a random email", async function () {
      const { organization } = await register(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.internet.password()
      );
      const name = faker.person.fullName();
      const inbox = await createInbox({
        organization_id: organization.id,
        name,
      });
      expect(inbox).toBeDefined();
      expect(inbox.organizationId.toString()).toBe(organization.id);
      expect(inbox.name).toBe(name);
      expect(inbox.email).toBeDefined();
    });
  });
});
