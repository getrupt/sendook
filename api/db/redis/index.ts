import Redis from "ioredis";

export const redis = new Redis({ host: process.env.REDIS_HOST });
console.log("REDIS_HOST", process.env.REDIS_HOST);

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error(err));
