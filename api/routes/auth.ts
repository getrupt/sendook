import { Router } from "express";
import type { Request, Response } from "express";
import { checkSchema } from "express-validator";
import passport from "passport";
import { login, register } from "../controllers/AuthController";
import { expressValidatorMiddleware } from "../middlewares/expressValidatorMiddleware";
import { getUserByEmail } from "../controllers/UserController";
import { deleteAccessTokenByUserId } from "../controllers/AccessTokenController";
import { ipFromRequest } from "../controllers/RequestUtilController";
import RuptCore from "@ruptjs/core";

const ruptCore = new RuptCore(`${process.env.RUPT_SECRET_KEY}`);

const router = Router();

router.get(
  "/user",
  passport.authenticate("bearer", { session: false }),
  (req: Request, res: Response) => {
    res.json(req.user);
  }
);

router.post(
  "/login",
  checkSchema(
    {
      email: { isEmail: true, normalizeEmail: true },
      password: { isString: true },
      challenge: { optional: true, isMongoId: true },
      code: { optional: true, isString: true },
      invite: { optional: true, isMongoId: true },
      fingerprint: { optional: true, isArray: true },
    },
    ["body"]
  ),
  expressValidatorMiddleware,
  async (
    req: Request<
      {},
      {},
      {
        email: string;
        password: string;
        challenge?: string;
        code?: string;
        fingerprint?: string[];
      }
    >,
    res: Response
  ) => {
    const login_result = await login(req.body.email, req.body.password);
    if (!login_result) {
      res.status(401).json({ errors: [{ msg: "Invalid credentials" }] });
      return;
    }
    if (!req.body.challenge && !req.body.code && req.body.fingerprint) {
      await ruptCore.evaluate({
        action: "login",
        user: login_result.user.id,
        email: login_result.user.email,
        fingerprint: req.body.fingerprint,
        ip: ipFromRequest(req),
      });
    }
    res.json(login_result);
  }
);

router.post(
  "/register",
  checkSchema(
    {
      email: { isEmail: true, normalizeEmail: true },
      first_name: { isString: true },
      password: { isString: true },
      invite: { optional: true, isMongoId: true },
      fingerprint: { optional: true, isArray: true },
      code: { optional: true, isString: true },
      challenge: { optional: true, isMongoId: true },
    },
    ["body"]
  ),
  expressValidatorMiddleware,
  async (
    req: Request<
      {},
      {},
      {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        fingerprint?: string[];
        challenge?: string;
        code?: string;
      }
    >,
    res: Response
  ) => {
    try {
      const preExistingUser = await getUserByEmail(req.body.email);
      if (preExistingUser) {
        throw Error("duplicate");
      }
      if (req.body.fingerprint) {
        await ruptCore.evaluate({
          action: "signup",
          email: req.body.email,
          fingerprint: req.body.fingerprint,
          ip: ipFromRequest(req),
        });
      }

      await register(
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.password
      );

      const login_result = await login(req.body.email, req.body.password);
      if (!login_result) {
        res.status(401).json({ errors: [{ msg: "Invalid credentials" }] });
        return;
      }

      res.json(login_result);
    } catch (err: any) {
      if (err.message && err.message.includes("duplicate")) {
        res.status(400).json({
          errors: [
            {
              msg: "An account with this email already exists. Please login instead",
            },
          ],
        });
        return;
      }
      console.error(err);
      res.status(500).json(err);
    }
  }
);

router.post(
  "/logout",
  passport.authenticate("bearer", { session: false }),
  async (req, res) => {
    if (!req.user?.id) {
      res.status(401).json({ errors: [{ msg: "Unauthorized" }] });
      return;
    }
    await deleteAccessTokenByUserId(req.user.id);
    res.json({ success: true });
  }
);

export default router;
