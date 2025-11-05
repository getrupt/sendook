import dotenv from "dotenv";
dotenv.config();
// @ts-ignore
import { expect, beforeAll, afterAll, describe, it } from "bun:test";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { login, register } from "../controllers/AuthController";

describe("AuthController", function () {
  beforeAll(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async function () {
    await mongoose.disconnect();
  });
  describe("register", function () {
    const email = faker.internet.email();
    const password = faker.internet.password();
    it("should register a new account", async function () {
      const { user, organization, apiKey } = await register(
        faker.person.firstName(),
        faker.person.lastName(),
        email,
        password
      );
      expect(user).toBeDefined();
      expect(organization).toBeDefined();
      expect(apiKey).toBeDefined();
    });

    describe("login", function () {
      it("should login a user", async function () {
        const user = await login(email, password);
        expect(user).toBeDefined();
      });
    });
  });
});
