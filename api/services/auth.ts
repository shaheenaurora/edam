import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { verifySessionToken } from "../services/session";
import { findUserByUnionId } from "../queries/users";

/**
 * Reads the session cookie and resolves it to a user. Throws when there is no
 * valid session; callers that treat auth as optional catch this.
 */
export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please sign in again.");
  }
  return user;
}
