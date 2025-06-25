// src/auth/auth.ts
import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    responseType: "code",
    responseMode: "query",
    redirectUrl: process.env.AZURE_REDIRECT_URI!,
    allowHttpForRedirectUrl: true,
    scope: ["profile", "email"]
  },
  (iss, sub, profile, accessToken, refreshToken, done) => {
    return done(null, profile);
  }
));

