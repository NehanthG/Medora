import React from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminLoginPage from '../pages/admin/AdminLoginPage';

export default function AdminLoginWrapper() {
  const { loginTypes } = useOutletContext();
  
  return <AdminLoginPage />;
}
