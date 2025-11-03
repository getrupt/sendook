import { hash } from "./EncryptionController";
import User from "../db/mongo/schemas/User";
import mongoose from "mongoose";

export async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.password = await hash(password);
  await user.save();
  return user;
}

export async function getUserById(id: string) {
  return await User.findById(id);
}

export async function getUserByEmail(email: string) {
  return await User.findOne({ email });
}
