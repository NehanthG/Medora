import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const bookingSlotSchema = new mongoose.Schema(
  {
    time: {
      type: Number, //  9 for 9 AM
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  hospitalId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Don't return password in queries by default
  },
  role: {
    type: String,
    default: 'doctor',
    enum: ['doctor'],
  },
  specialisation: {
    type: String,
    required: true,
  },
  shift: {
    start: {
      type: Number, // 24 hour format
      required: true,
    },
    end: {
      type: Number, // 24 hour format
      required: true,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  ],
  bookings: [bookingSlotSchema],
  lastLogin: {
    type: Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    console.log('Hashing password for doctor:', this.email);
    console.log('Original password length:', this.password ? this.password.length : 0);
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    console.log('Password hashed successfully');
    console.log('Hashed password length:', this.password ? this.password.length : 0);
    
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
doctorSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    console.log('Comparing passwords...');
    console.log('Entered password length:', enteredPassword ? enteredPassword.length : 0);
    console.log('Stored hash length:', this.password ? this.password.length : 0);
    
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('Error in matchPassword:', error);
    throw error;
  }
};

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
