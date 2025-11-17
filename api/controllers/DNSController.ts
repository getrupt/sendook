import { resolveMx, resolveTxt } from 'node:dns/promises';
import type { MxRecord } from 'node:dns';

export async function getDNSMXRecords({
  domain,
}: {
  domain: string;
}): Promise<MxRecord[]> {
  try {
    return await resolveMx(domain);
  } catch (error) {
    console.error('Error resolving MX records:', error);
    return [];
  }
}

export async function getDNSTXTRecords({
  domain,
}: {
  domain: string;
}): Promise<string[]> {
  try {
    const records = await resolveTxt(domain);
    return records[0] ?? [];
  } catch (error) {
    console.error('Error resolving TXT records:', error);
    return [];
  }
}
