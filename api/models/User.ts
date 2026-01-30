import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';


export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'user' | 'admin';
  bio?: string;
  cv_list: mongoose.Types.ObjectId[];
  onboardingCompleted: boolean;
  careerGoal?: 'new-job' | 'internship' | 'career-switch';
  googleId?: string;
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
    required: function(this: IUser) {
      return !this.googleId; // Password chỉ required nếu không có Google OAuth
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
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  bio: { 
    type: String, 
    default: '' 
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
  }
}, { 
  timestamps: true 
});


userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu có password và đã được modify
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