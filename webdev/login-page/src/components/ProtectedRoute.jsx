import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If there's no token or the role is invalid, redirect to login
  if (!token || (role !== 'ROLE_ROLE_ADMIN' && role !== 'ROLE_ROLE_MISSTAFF')) {
    return <Navigate to="/" />;
  }

  return children; // Render the protected component if the token and role are valid
};

export default ProtectedRoute;
