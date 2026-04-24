import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, hashPassword, checkPasswordHash, validateJWT } from "./auth.js"
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { getBearerToken } from "./auth.js";



describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
});


describe("Make JWT", () => {
  const userID = "4cc7f31b-4db7-4889-a679-8eb88c1fee8b";
  const expiresIn = 10000;
  const secret = "penguin"

  it("should return true for JWT Parts length to be 3", async () => {
    const jwt = await makeJWT(userID, expiresIn, secret);
    const parts = jwt.split(".");
    expect(parts.length).toBe(3);
  });
});


describe("Validate JWT", () => {
  const userID = "4cc7f31b-4db7-4889-a679-8eb88c1fee8b";
  const expiresIn = 10000;
  const secret = "penguin"

  const jwtString = makeJWT(userID, expiresIn, secret)

  it("should return true for token matches userID", async () => {
    const token = validateJWT(jwtString, secret);
    expect(token).toBe(userID);
  });
});

describe("Verify JWT userID", () => {
  const userID = "4cc7f31b-4db7-4889-a679-8eb88c1fee8b";
  const expiresIn = 10000;
  const secret1 = "penguin"
  const secret2 = "dolphin"

  it("should reject a JWT signed with the wrong secret", () => {
  const token = makeJWT(userID, expiresIn, secret1);
  expect(() => validateJWT(token, secret2)).toThrow();
    });
});

describe("Expired Tokens", () => {
  const userID = "4cc7f31b-4db7-4889-a679-8eb88c1fee8b";
  const expiresIn = -1;
  const secret = "penguin"

  it("should reject an expired JWT", () => {
    const token = makeJWT(userID, expiresIn, secret);
    expect(() => validateJWT(token, secret)).toThrow();
  });
})

describe("getBearerToken", () => {
  it("returns the token from a valid Authorization header", () => {
    const req = {
      get: (name: string) =>
        name === "authorization" ? "Bearer abc123": undefined,
    } as unknown as Request;

    expect(getBearerToken(req)).toBe("abc123");
  });

  it("throws when the Authorization header is missing", () => {
    const req = {
      get: (_name: string) => undefined,
    } as unknown as Request;

    expect(() => getBearerToken(req)).toThrow();
  });
})