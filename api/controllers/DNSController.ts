import { resolveMx } from 'node:dns/promises';
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
