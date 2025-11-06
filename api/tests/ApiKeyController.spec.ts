import dotenv from "dotenv";
dotenv.config();
// @ts-ignore
import { expect, beforeAll, afterAll, describe, it } from "bun:test";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { getApiKeyByKey } from "../controllers/ApiKeyController";
import { register } from "../controllers/AuthController";

describe("ApiKeyController", function () {
  beforeAll(async function () {
    await mongoose.connect(process.env.MONGO_URI);
  });
  afterAll(async function () {
    await mongoose.disconnect();
  });
  describe("getApiKeyByKey", function () {
    it("should get an api key by key", async function () {
      const { apiKey } = await register(
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.internet.password()
      );

      const retrievedApiKey = await getApiKeyByKey(apiKey.key);
      expect(retrievedApiKey).toBeDefined();
      expect(retrievedApiKey?.id).toBe(apiKey.id);
    });
  });
});
