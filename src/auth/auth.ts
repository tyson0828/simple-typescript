// src/auth/auth.ts
import passport from "passport";
import { OIDCStrategy } from "passport-azure-ad";
import jwt from "jsonwebtoken"; // Required for decoding token
import { RequestHandler, Request, Response, NextFunction } from "express";

// Required: Serialize and deserialize user for session support
passport.serializeUser((user, done) => done(null, user));
//passport.deserializeUser((obj, done) => done(null, obj));

interface User {
  id?: string;
  displayName?: string;
  [key: string]: any;
}
passport.deserializeUser((obj: User, done) => done(null, obj));

//passport.deserializeUser((obj: any, done) => done(null, obj));

// Azure AD Strategy configuration
passport.use(new OIDCStrategy(
  {
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    responseType: "code",
    responseMode: "query",
    redirectUrl: process.env.AZURE_REDIRECT_URI!,
    allowHttpForRedirectUrl: true,
    scope: ["profile", "email"],
    passReqToCallback: false  // Add this line to resolve the TS error
  },
  (
    iss: string,
    sub: string,
    profile: any,
    accessToken: string,
    refreshToken: string,
    done: Function
  ) => {
    return done(null, profile);
  }
));

/*
passport.use(new OIDCStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID!,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
    responseType: "code",
    responseMode: "query",
    redirectUrl: process.env.AZURE_REDIRECT_URI!,
    allowHttpForRedirectUrl: true, // ❗️In production, this should be false unless really necessary
    scope: ["profile", "email", "openid", "groups"], // Include "openid" and "groups"
  },
  (iss, sub, profile, accessToken, refreshToken, done) => {
    // You can enhance this section to attach accessToken if needed
    return done(null, profile);
  }
));
*/

// Export middleware for authentication
export const azureAuthenticate: RequestHandler = passport.authenticate("azuread-openidconnect", {
  failureRedirect: "/api/login-failure",
});

// Middleware to authorize based on Azure AD Group
export function authorizeByAzureADGroup(allowedGroups: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;

    try {
      decoded = jwt.decode(token);
    } catch (error) {
      return res.status(403).json({ message: "Failed to decode token" });
    }

    if (!decoded || !decoded.groups) {
      return res.status(403).json({ message: "No group claims found in token" });
    }

    const userGroups: string[] = decoded.groups;
    const isAuthorized = userGroups.some(groupId => allowedGroups.includes(groupId));

    if (!isAuthorized) {
      return res.status(403).json({ message: "Access denied: insufficient AD group privileges" });
    }

    // Optionally store user info in req.user
    req.user = decoded;
    next();
  };
}


// Replace this with your actual group object IDs from Azure AD
//const ALLOWED_GROUP_IDS = [
//  "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" // e.g., SMB Access Group
//];

