import type { Request } from "express";

export function ipFromRequest(
  req: Request & { headers?: { "x-real-ip"?: string } }
) {
  if (process.env.DEBUG) {
    return req.headers["x-real-ip"] ?? generateRandomIP();
  }
  return req.headers["x-real-ip"]?.split(",")?.[0];
}

function generateRandomIP() {
  return `138.199.${Math.floor(Math.random() * 14) + 64}.${Math.floor(
    Math.random() * 255
  )}`;
}
