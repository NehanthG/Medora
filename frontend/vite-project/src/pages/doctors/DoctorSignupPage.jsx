import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, BriefcaseMedical, MapPin, Calendar, Stethoscope } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useDoctorAuthStore } from '../../stores/doctorAuthStore';
import toast from 'react-hot-toast';

// Reusable InputField component
const InputField = ({ icon: Icon, type, id, label, placeholder, value, onChange, required = true, options, ...props }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label fw-semibold">{label}{required && ' *'}</label>
    <div className="d-flex align-items-center border rounded-pill px-3 py-1 shadow-sm">
      <Icon size={22} className="text-secondary me-3" />
      {type === 'select' ? (
        <select
          id={id}
          className="form-select border-0 flex-grow-1 px-2 py-1 bg-transparent"
          value={value}
          onChange={onChange}
          required={required}
          {...props}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          className="form-control border-0 flex-grow-1 px-2 py-1"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </div>
  </div>
);

export default function DoctorSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    specialisation: "",
    hospitalId: "",
    shiftStart: "",
    shiftEnd: "",
    experience: "",
    qualification: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const { signup, isSigningUp } = useDoctorAuthStore();
  const { t } = useTranslation();

  const specialisations = [
    { value: 'Cardiologist', label: 'Cardiologist' },
    { value: 'Dermatologist', label: 'Dermatologist' },
    { value: 'Neurologist', label: 'Neurologist' },
    { value: 'Pediatrician', label: 'Pediatrician' },
    { value: 'General Physician', label: 'General Physician' },
    { value: 'ENT', label: 'ENT Specialist' },
    { value: 'Ophthalmologist', label: 'Ophthalmologist' },
    { value: 'Gynecologist', label: 'Gynecologist' },
    { value: 'Dentist', label: 'Dentist' },
    { value: 'Psychiatrist', label: 'Psychiatrist' },
  ];

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      return toast.error(t('signup.errors.passwordMismatch'));
    }
    
    if (formData.password.length < 6) {
      return toast.error(t('signup.errors.passwordLength'));
    }
    
    try {
      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phoneNumber,
        specialisation: formData.specialisation,
        hospitalId: formData.hospitalId,
        shift: {
          start: parseInt(formData.shiftStart),
          end: parseInt(formData.shiftEnd)
        },
        experience: parseInt(formData.experience),
        qualification: formData.qualification,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.pincode
        }
      });
      
      if (result?.success) {
        toast.success(t('signup.success'));
        navigate('/doctor/dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || t('signup.errors.general'));
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f6f8fb" }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: "600px", width: "100%", borderRadius: "18px" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1">{t('doctor.signup.title', 'Doctor Registration')}</h2>
            <p className="text-muted">
              {t('doctor.signup.subtitle', 'Create your doctor account to get started')}
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6">
                <InputField
                  icon={User}
                  type="text"
                  id="name"
                  label={t('signup.fullName', 'Full Name')}
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  icon={Mail}
                  type="email"
                  id="email"
                  label={t('signup.email', 'Email Address')}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <InputField
                  icon={Lock}
                  type="password"
                  id="password"
                  label={t('signup.password', 'Password')}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  icon={Lock}
                  type="password"
                  id="confirmPassword"
                  label={t('signup.confirmPassword', 'Confirm Password')}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <InputField
                  icon={Phone}
                  type="tel"
                  id="phoneNumber"
                  label={t('signup.phoneNumber', 'Phone Number')}
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  icon={BriefcaseMedical}
                  type="select"
                  id="specialisation"
                  label={t('doctor.specialisation', 'Specialisation')}
                  value={formData.specialisation}
                  onChange={handleChange}
                  options={specialisations}
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <InputField
                  icon={Stethoscope}
                  type="text"
                  id="qualification"
                  label={t('doctor.qualification', 'Qualification')}
                  placeholder="MBBS, MD, etc."
                  value={formData.qualification}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <InputField
                  icon={User}
                  type="number"
                  id="experience"
                  label={t('doctor.experience', 'Experience (years)')}
                  placeholder="5"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="row">
              <div className="col-md-6">
                <InputField
                  icon={Calendar}
                  type="text"
                  id="hospitalId"
                  label={t('doctor.hospitalId', 'Hospital ID')}
                  placeholder="Enter hospital ID"
                  value={formData.hospitalId}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <InputField
                  icon={Calendar}
                  type="number"
                  id="shiftStart"
                  label={t('doctor.shiftStart', 'Shift Start')}
                  placeholder="9"
                  min="0"
                  max="23"
                  value={formData.shiftStart}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <InputField
                  icon={Calendar}
                  type="number"
                  id="shiftEnd"
                  label={t('doctor.shiftEnd', 'Shift End')}
                  placeholder="17"
                  min="1"
                  max="24"
                  value={formData.shiftEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <h6 className="mt-4 mb-3 fw-bold">{t('doctor.address', 'Address')}</h6>
            <div className="row">
              <div className="col-12 mb-3">
                <InputField
                  icon={MapPin}
                  type="text"
                  id="address"
                  label={t('signup.address', 'Street Address')}
                  placeholder="123 Main St"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <InputField
                  icon={MapPin}
                  type="text"
                  id="city"
                  label={t('signup.city', 'City')}
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <InputField
                  icon={MapPin}
                  type="text"
                  id="state"
                  label={t('signup.state', 'State')}
                  placeholder="Maharashtra"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <InputField
                  icon={MapPin}
                  type="text"
                  id="pincode"
                  label={t('signup.pincode', 'Pincode')}
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 rounded-pill fw-bold mt-3"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('signup.creatingAccount', 'Creating Account...')}
                </>
              ) : (
                t('signup.createAccount', 'Create Account')
              )}
            </button>
            
            <p className="text-center mt-3 mb-0">
              {t('signup.alreadyHaveAccount', 'Already have an account?')}{' '}
              <Link to="/doctor/login" className="text-primary fw-semibold text-decoration-none">
                {t('signup.signIn', 'Sign In')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
