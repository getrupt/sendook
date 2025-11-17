import mongoose, { type HydratedDocument } from "mongoose";
import Domain from "../db/mongo/schemas/Domain";
import { getDNSMXRecords, getDNSTXTRecords } from "./DNSController";
import type IDomain from "../models/Domain";
import { getDomainVerificationStatus } from "./SESController";

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

export async function verifyDomainDNS({
  domain,
}: {
  domain: HydratedDocument<IDomain>;
}): Promise<{ verified: boolean; domain: HydratedDocument<IDomain> }> {
  const mxRecords = await getDNSMXRecords({ domain: domain.name });
  
  let mxRecordFound;
  if (mxRecords && Array.isArray(mxRecords)) {
    mxRecordFound = domain.records.find(
      (domainRecord) =>
        domainRecord.type === "MX" &&
        mxRecords.find((dnsRecord) => {
          return (
            typeof dnsRecord.exchange === "string" &&
            dnsRecord.exchange.toLowerCase() === domainRecord.value.toLowerCase()
          );
        })
    );
  }

  if (mxRecordFound) {
    mxRecordFound.status = "verified";
  }

  const dmarcRecord = await getDNSTXTRecords({ domain: domain.name });
  console.log(dmarcRecord);
  let dmarcRecordFound;
  if (dmarcRecord && Array.isArray(dmarcRecord)) {
    dmarcRecordFound = domain.records.find(
      (domainRecord) =>
        domainRecord.type === "TXT" &&
        dmarcRecord.find((dnsRecord) => dnsRecord === domainRecord.value)
    );
  }
  if (dmarcRecordFound) {
    dmarcRecordFound.status = "verified";
  }

  const verifiedDomainStatus = await getDomainVerificationStatus({ domain: domain.name });

  domain.verified = verifiedDomainStatus.DkimAttributes?.[domain.name]?.DkimVerificationStatus === "Success" ? true : false;
  await domain.save();
  
  return { verified: domain.verified, domain };
}
