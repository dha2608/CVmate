import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

import logger from '../utils/logger.js';

// Generate JWT Token (unused but kept for potential future use)
// const generateToken = (id: string) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET as string, {
//     expiresIn: '30d',
//   });
// };

// Chỉ khởi tạo Google Strategy nếu có đủ env vars
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const backendBaseUrl =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
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
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Tìm user theo Google ID hoặc email
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Kiểm tra xem email đã tồn tại chưa
            user = await User.findOne({ email: profile.emails?.[0]?.value });

            if (user) {
              // Nếu user đã tồn tại với email/password, link Google account
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              await user.save();
            } else {
              // Tạo user mới
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
  logger.info('✅ Google OAuth strategy initialized');
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
