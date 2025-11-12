import { generateRandomSecureToken } from "./EncryptionController";
import ApiKey from "../db/mongo/schemas/ApiKey";
import mongoose from "mongoose";

export async function createApiKey({
  organizationId,
  name,
}: {
  organizationId: string;
  name: string;
}) {
  const apiKey = new ApiKey();
  apiKey.name = name;
  apiKey.key = await generateRandomSecureToken();
  apiKey.organizationId = new mongoose.Types.ObjectId(organizationId);
  await apiKey.save();
  return apiKey;
}

export async function getApiKeysByOrganizationId(organizationId: string) {
  return await ApiKey.find({ organizationId });
}

export async function getApiKeyById(apiKeyId: string) {
  return await ApiKey.findById(apiKeyId);
}

export async function getApiKeyByIdAndOrganizationId({
  apiKeyId,
  organizationId,
}: {
  apiKeyId: string;
  organizationId: string;
}) {
  return await ApiKey.findOne({ _id: apiKeyId, organizationId });
}

export async function activateApiKey(apiKeyId: string, active: boolean) {
  return await ApiKey.findByIdAndUpdate(apiKeyId, { active });
}

export async function getApiKeyByKey(key: string) {
  return await ApiKey.findOne({ key });
}

export async function deleteApiKey(apiKeyId: string) {
  return await ApiKey.findByIdAndDelete(apiKeyId);
}
