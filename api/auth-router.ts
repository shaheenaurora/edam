import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { issueLoginCode, verifyLoginCode, LoginError } from "./services/otp";

function setSessionCookie(resHeaders: Headers, reqHeaders: Headers, token: string) {
  const opts = getSessionCookieOptions(reqHeaders);
  resHeaders.append(
    "set-cookie",
    cookie.serialize(Session.cookieName, token, {
      httpOnly: opts.httpOnly,
      path: opts.path,
      sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
      secure: opts.secure,
      maxAge: Session.maxAgeMs / 1000,
    }),
  );
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  requestCode: publicQuery
    .input(z.object({ email: z.string().email().max(320) }))
    .mutation(async ({ input }) => {
      try {
        await issueLoginCode(input.email);
      } catch (e) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not send the code. Try again." });
      }
      return { sent: true };
    }),

  verifyCode: publicQuery
    .input(z.object({ email: z.string().email().max(320), code: z.string().min(4).max(8) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { token } = await verifyLoginCode(input.email, input.code);
        setSessionCookie(ctx.resHeaders, ctx.req.headers, token);
        return { ok: true };
      } catch (e) {
        if (e instanceof LoginError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: e.message });
        }
        throw e;
      }
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
