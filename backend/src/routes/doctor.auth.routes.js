import express from 'express';
import { 
  doctorLogin, 
  checkDoctorAuth, 
  doctorLogout, 
  updateDoctorProfile,
  registerDoctor 
} from '../controllers/doctor.auth.controllers.js';
import { authenticateDoctor } from '../middleware/doctorAuth.js';

const router = express.Router();

// Public routes
router.post('/register', registerDoctor);
router.post('/login', doctorLogin);
router.get('/check', checkDoctorAuth);
router.post('/logout', doctorLogout);

// Protected routes
router.use(authenticateDoctor);
router.put('/profile/update', updateDoctorProfile);

// Add more protected routes here

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

export default router;
