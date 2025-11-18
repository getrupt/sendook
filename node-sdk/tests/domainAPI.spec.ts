import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
dotenv.config();
// @ts-ignore
import { expect, describe, it } from "bun:test";
import Sendook from "../index";

describe("DomainAPI", function () {
  describe("createDomain", function () {
    it("should create a domain", async function () {
      const domainName = faker.internet.domainName();
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const domain = await sendook.domain.create({
        name: domainName,
      });
      expect(domain).toBeDefined();
      expect(domain.name).toBe(domainName);
    });
  });
  describe("verifyDomain", function () {
    it("should verify a domain", async function () {
      const domainName = "marcwhitbread.com";
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      try {
        const existingDomain = await sendook.domain.get({
          domainId: domainName,
        });
        if (existingDomain) {
          await sendook.domain.delete({
            domainId: existingDomain.name,
          });
        }
      } catch (error) { }
      const domain = await sendook.domain.create({
        name: domainName,
      });
      const verifiedDomain = await sendook.domain.verify({
        domainId: domain.name,
      });
      expect(verifiedDomain).toBeDefined();
      expect(verifiedDomain.name).toBe(domainName);
      expect(verifiedDomain.verified).toBe(true);
    });
  });
  describe("getDomainDNS", function () {
    it("should get the DNS records for a domain", async function () {
      const domainName = "marcwhitbread.com";
      const sendook = new Sendook(process.env.API_KEY, process.env.API_URL);
      const dnsRecords = await sendook.domain.dns({
        domainId: domainName,
      });
      expect(dnsRecords).toBeDefined();
      expect(dnsRecords.length).toBeGreaterThan(0);
    });
  });
});
