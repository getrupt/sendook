import mongoose from "mongoose";
import Domain from "../db/mongo/schemas/Domain";

export async function createDomain({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  const domain = new Domain();
  domain.organizationId = new mongoose.Types.ObjectId(organizationId);
  domain.name = name;
  await domain.save();
  return domain;
}

export async function getDomainsByOrganizationId({
  organizationId,
}: {
  organizationId: string;
}) {
  return await Domain.find({
    organizationId: new mongoose.Types.ObjectId(organizationId),
  });
}

export async function getDomainByOrganizationIdAndName({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  return await Domain.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    name,
  });
}

export async function getVerifiedDomainByOrganizationIdAndName({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  return await Domain.findOne({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    name: name,
    verified: true,
  });
}

export async function deleteDomainByOrganizationIdAndName({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  return await Domain.findOneAndDelete({
    organizationId: new mongoose.Types.ObjectId(organizationId),
    name: name,
  });
}
