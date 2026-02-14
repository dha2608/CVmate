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
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
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
              // 总是更新 Google 的头像和姓名（如果用户没有手动上传过）
              // 如果用户已经有自定义头像（不是 Google 的 URL），则保留
              const isGoogleAvatar = user.avatar?.includes('googleusercontent.com') || !user.avatar;
              if (isGoogleAvatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              // 更新姓名（如果用户没有自定义过）
              if (profile.displayName) {
                user.name = profile.displayName;
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
          } else {
            // 用户已存在，更新 Google 的头像和姓名（如果用户没有手动上传过）
            const isGoogleAvatar = user.avatar?.includes('googleusercontent.com') || !user.avatar;
            if (isGoogleAvatar && profile.photos?.[0]?.value) {
              user.avatar = profile.photos[0].value;
            }
            // 更新姓名（如果用户没有自定义过，或者使用 Google 的显示名称）
            if (profile.displayName) {
              user.name = profile.displayName;
            }
            await user.save();
          }

          return done(null, user);
        } catch (error: any) {
          return done(error, null);
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
