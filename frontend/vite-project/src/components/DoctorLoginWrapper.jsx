import React from 'react';
import { useOutletContext } from 'react-router-dom';
import DoctorLoginPage from '../pages/doctors/DoctorLoginPage';

export default function DoctorLoginWrapper() {
  const { loginTypes } = useOutletContext();
  return <DoctorLoginPage />;
}
