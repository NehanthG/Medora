import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Doctor from '../models/doctorSchema.js';

export const doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if doctor exists and explicitly include password field (case-insensitive email)
    const doctor = await Doctor.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    }).select('+password');
    
    if (!doctor) {
      console.log('No doctor found with email:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('Found doctor:', {
      email: doctor.email,
      hasPassword: !!doctor.password,
      passwordLength: doctor.password ? doctor.password.length : 0
    });

    // Check if password exists and is a string
    if (!doctor.password || typeof doctor.password !== 'string') {
      console.error('Invalid password format for doctor:', doctor._id);
      return res.status(500).json({ 
        success: false, 
        message: 'Authentication error' 
      });
    }

    // Check if password is correct using direct bcrypt comparison
    console.log('Attempting to compare password...');
    console.log('Stored password hash:', doctor.password);
    console.log('Provided password length:', password ? password.length : 0);
    
    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, doctor.password);
      console.log('Password comparison result:', isMatch);
      
      if (!isMatch) {
        console.log('Password comparison failed');
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({
        success: false,
        message: 'Error during password comparison',
        error: err.message
      });
    }

    // Create and sign JWT token
    const token = jwt.sign(
      { id: doctor._id, role: 'doctor' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...doctorData } = doctor.toObject();

    res.status(200).json({
      success: true,
      token,
      doctor: doctorData
    });
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkDoctorAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    const doctor = await Doctor.findById(decoded.id).select('-password');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    console.error('Check doctor auth error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const doctorLogout = async (req, res) => {
  // Since we're using JWT, the client should simply discard the token
  // In a real app, you might want to implement token blacklisting
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const updateDoctorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If password is being updated, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor: updatedDoctor });
  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      specialisation,
      hospitalId,
      shift,
      experience,
      qualification,
      address
    } = req.body;

    // Check if doctor already exists
    let doctor = await Doctor.findOne({ email });
    if (doctor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor already exists with this email' 
      });
    }

    // Log the password before creating the doctor
    console.log('Creating new doctor with email:', email);
    console.log('Raw password length:', password ? password.length : 0);
    
    // Create new doctor - the password will be hashed by the pre-save hook
    doctor = new Doctor({
      name,
      email,
      password, // This will be hashed by the pre-save hook
      phone,
      specialisation,
      hospitalId,
      shift,
      experience,
      qualification,
      address,
      isActive: true
    });

    // Save doctor to database - this will trigger the pre-save hook to hash the password
    console.log('Saving doctor...');
    await doctor.save();
    console.log('Doctor saved successfully');

    // Create and sign JWT token
    const payload = {
      id: doctor._id,
      role: 'doctor'
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const doctorData = doctor.toObject();
    delete doctorData.password;

    res.status(201).json({
      success: true,
      token,
      doctor: doctorData
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};
