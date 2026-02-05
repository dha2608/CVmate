import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  coverPhoto?: string;
  role: 'user' | 'admin';
  bio?: string;
  headline?: string;
  location?: string;
  yearsOfExperience?: number;
  currentRole?: string;
  industries?: string[];
  skills?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  isPublicProfile?: boolean;
  cv_list: mongoose.Types.ObjectId[];
  onboardingCompleted: boolean;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  googleId?: string;
  subscription?: {
    plan: 'free' | 'premium';
    status: 'active' | 'cancelled' | 'expired';
    startDate?: Date;
    endDate?: Date;
    paymentMethod?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required(this: IUser) {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  avatar: { 
    type: String, 
    default: '' 
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  bio: { 
    type: String, 
    default: '' 
  },
  headline: {
    type: String,
    trim: true,
    default: '',
  },
  location: {
    type: String,
    trim: true,
    default: '',
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
  },
  currentRole: {
    type: String,
    trim: true,
    default: '',
  },
  industries: [{
    type: String,
    trim: true,
  }],
  skills: [{
    type: String,
    trim: true,
  }],
  socialLinks: {
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
  },
  isPublicProfile: {
    type: Boolean,
    default: true,
  },
  cv_list: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Resume' 
  }],
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  careerGoal: {
    type: String,
    enum: ['new-job', 'internship', 'career-switch'],
    default: null
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    paymentMethod: String,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  }
}, { 
  timestamps: true 
});

// Indexes for performance
// Note: email and googleId already have unique: true in schema definition above
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
userSchema.index({ isPublicProfile: 1 });


userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next(); 
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    return next(error);
  }
});

userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;