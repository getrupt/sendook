import { Strategy as BearerStrategy } from "passport-http-bearer";
import { getAccessToken } from "./AccessTokenController";
import { getUserById } from "./UserController";
import { getApiKeyByKey } from "./ApiKeyController";
import { getOrganizationById, getOrganizationsByUserId } from "./OrganizationController";

export const passportBearerStrategy = new BearerStrategy(
  async (token, done) => {
    try {
      const access_token = await getAccessToken(token);
      if (!access_token || !access_token.userId) {
        return done(null, false);
      }
      const user = await getUserById(access_token.userId.toString());
      if (!user) {
        return done(null, false);
      }
      const organizations = await getOrganizationsByUserId(user?.id);
      return done(null, {
        ...(user.toJSON()),
        organizations,
      });
    } catch (err) {
      return done(err, null);
    }
  }
);

export const passportApiKeyStrategy = new BearerStrategy(
  async (token, done) => {
    try {
      const apiKey = await getApiKeyByKey(token);
      if (!apiKey) {
        return done(null, false);
      }
      const organization = await getOrganizationById(apiKey.organizationId.toString());
      if (!organization) {
        return done(null, false);
      }
      return done(null, {
        ...(organization?.toJSON()),
        apiKey,
      });
    } catch (err) {
      return done(err, null);
    }
  }
);
