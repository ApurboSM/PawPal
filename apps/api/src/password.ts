import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/** Produces "<hex hash>.<hex salt>" — the only format comparePasswords accepts. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  // Anything not in "<hash>.<salt>" form (a legacy plain-text row, a truncated value)
  // must fail the check rather than throw — an exception here escapes the passport
  // verify callback and takes the whole process down.
  const [hashed, salt] = stored?.split(".") ?? [];
  if (!hashed || !salt) {
    return false;
  }

  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;

  if (hashedBuf.length !== suppliedBuf.length) {
    return false;
  }

  return timingSafeEqual(hashedBuf, suppliedBuf);
}
