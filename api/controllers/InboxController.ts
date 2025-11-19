import Inbox from "../db/mongo/schemas/Inbox";
import mongoose from "mongoose";

export async function createInbox({
  organization_id,
  domain_id,
  name,
  email,
}: {
  organization_id: string;
  domain_id?: string;
  name: string;
  email?: string;
}) {
  const inbox = new Inbox();
  inbox.organizationId = new mongoose.Types.ObjectId(organization_id);
  inbox.domainId = domain_id
    ? new mongoose.Types.ObjectId(domain_id)
    : undefined;
  inbox.name = name;
  inbox.email = email || await getNewRandomInboxEmail({ name });
  await inbox.save();
  return inbox;
}

export async function getInboxesByOrganizationId(organization_id: string) {
  return await Inbox.find({
    organizationId: new mongoose.Types.ObjectId(organization_id),
  });
}

export async function getInboxByOrganizationIdAndInboxId({
  organizationId,
  inboxId,
}: {
  organizationId: string;
  inboxId: string;
}) {
  return await Inbox.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    _id: new mongoose.Types.ObjectId(inboxId),
  });
}

export async function deleteInboxByOrganizationIdAndInboxId({
  organizationId,
  inboxId,
}: {
  organizationId: string;
  inboxId: string;
}) {
  return await Inbox.findOneAndDelete({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    _id: new mongoose.Types.ObjectId(inboxId),
  });
}

export async function getInboxByEmail(email: string) {
  return await Inbox.findOne({ email });
}

export async function getNewRandomInboxEmail({ name }: { name: string }) {
  const lowerCaseName = name.toLowerCase();
  const email = `${lowerCaseName.replace(/[^a-zA-Z0-9]/g, "-")}-${Math.random()
    .toString(36)
    .substring(2, 12)}@${process.env.DEFAULT_EMAIL_DOMAIN}`;
  const inbox = await getInboxByEmail(email);
  if (inbox) {
    return await getNewRandomInboxEmail({ name });
  }
  return email;
}
