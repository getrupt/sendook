import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_HOST);

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error(err));
