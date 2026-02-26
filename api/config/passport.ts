import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import logger from '../utils/logger.js';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const backendBaseUrl =
    process.env.GOOGLE_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    process.env.API_BASE_URL ||
    'http://localhost:5001';

  const normalizedBackendBaseUrl = backendBaseUrl.endsWith('/')
    ? backendBaseUrl.slice(0, -1)
    : backendBaseUrl;

  const resolvedCallbackUrl =
    process.env.GOOGLE_CALLBACK_URL ||
    `${normalizedBackendBaseUrl}/api/auth/google/callback`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: resolvedCallbackUrl,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            } else {
              user = await User.create({
                name: profile.displayName || profile.name?.givenName || 'User',
                email: profile.emails?.[0]?.value,
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
                onboardingCompleted: false,
              });
            }
          }

          return done(null, user);
        } catch (error: any) {
          return done(error);
        }
      }
    )
  );

  logger.info('✅ Google OAuth strategy initialized', { resolvedCallbackUrl });
} else {
  logger.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable.');
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
