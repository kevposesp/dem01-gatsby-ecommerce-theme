import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Initial.css';

const User = () => {
  const { user } = useAuth();

  return (
    <div className='icon-initial'>{user.firstName.charAt(0).toUpperCase()}</div>
  )
};

export default User;
