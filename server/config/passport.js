import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // ✅ Use absolute URL, not relative
      callbackURL:
        process.env.GOOGLE_AUTH_REDIRECT_URI ||
        "http://localhost:3000/api/auth/vendor/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // ✅ STEP 1: Find by email (IMPORTANT)
        let user = await User.findOne({ email });

        if (user) {
          // ✅ STEP 2: Link Google account if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
        } else {
          // ✅ STEP 3: Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            role: "vendor",
            password: "google_oauth_verified",
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

export default passport;
