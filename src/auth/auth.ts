import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";
import express from "express";

const router = express.Router();

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

passport.use(
  new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    responseType: "code",
    responseMode: "query",
    redirectUrl: process.env.CALLBACK_URL!,
    allowHttpForRedirectUrl: true,
    passReqToCallback: false,
    scope: ["profile", "email"]
  },
  (iss, sub, profile, accessToken, refreshToken, done) => {
    profile.accessToken = accessToken;
    return done(null, profile);
  })
);

// Routes
router.get("/login", passport.authenticate("azuread-openidconnect"));

router.get("/auth/callback", passport.authenticate("azuread-openidconnect", {
  failureRedirect: "/login"
}), (req, res) => {
  res.json({ accessToken: req.user?.accessToken });
});

export default router;

