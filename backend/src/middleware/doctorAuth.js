import jwt from 'jsonwebtoken';
import Doctor from '../models/doctorSchema.js';

export const authenticateDoctor = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'doctor') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const doctor = await Doctor.findById(decoded.id).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    req.doctor = doctor;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const checkDoctorRole = (req, res, next) => {
  if (req.doctor && req.doctor.role === 'doctor') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied' });
  }
};
