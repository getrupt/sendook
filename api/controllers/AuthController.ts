import { createOrganization } from "./OrganizationController";
import { createApiKey } from "./ApiKeyController";
import { createUser, getUserByEmail } from "./UserController";
import { createAccessToken } from "./AccessTokenController";
import { verifyHash } from "./EncryptionController";
import { createInbox, getInboxByEmail, getNewRandomInboxEmail } from "./InboxController";

export async function login(username: string, password: string) {
  const user = await getUserByEmail(username);
  if (!user) {
    return null;
  }
  const verified = await verifyHash(password, user.password);
  if (!verified) {
    return null;
  }
  const access_token = await createAccessToken(user.id);
  return { user, token: access_token };
}

export async function register(
  firstName: string,
  lastName: string,
  username: string,
  password: string
) {
  const user = await createUser(firstName, lastName, username, password);

  const { organization } = await createOrganization({
    name: "Default Organization",
    user,
  });

  const apiKey = await createApiKey({
    organizationId: organization.id,
    name: "Default API Key",
  });

  const inboxEmail = await getNewRandomInboxEmail({ name: "inbox" });

  const inbox = await createInbox({
    organization_id: organization.id,
    name: "My Inbox",
    email: inboxEmail,
  });

  return { user, organization, apiKey, inbox };
}
