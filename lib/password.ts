/**
 * 密码哈希（node:crypto scrypt，无第三方依赖）
 *
 * 存储格式：`scrypt$N$r$p$salt$hash`
 *  - N/r/p 为 scrypt 参数（与 Node 默认一致：N=16384, r=8, p=1）
 *  - salt 16 字节随机盐（hex），hash 为 64 字节派生密钥（hex）
 */
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const PREFIX = "scrypt$";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  }).toString("hex");
  return `${PREFIX}${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash}`;
}

/** 是否已哈希存储（否则视为旧版明文，需升级） */
export function isHashedPassword(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!isHashedPassword(stored)) return false;
  const parts = stored.split("$");
  if (parts.length !== 6) return false;
  const [, nStr, rStr, pStr, salt, hashHex] = parts;
  const n = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!n || !r || !p) return false;
  try {
    const derived = scryptSync(password, salt, KEY_LEN, { N: n, r, p });
    const expected = Buffer.from(hashHex, "hex");
    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  } catch {
    return false;
  }
}
