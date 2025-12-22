import React from 'react';
import { useOutletContext } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

export default function UserLoginWrapper() {
  const { loginTypes } = useOutletContext();
  
  return <LoginPage />;
}
