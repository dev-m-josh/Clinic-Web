import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const user = localStorage.getItem("myUser");
    const token = localStorage.getItem("myToken");
    const navigate = useNavigate();

    useEffect(() => {
      if (!token || !user || user.UserRole !== 'Admin') {
        navigate('/appointments');
        return
      };
    }, [token, user, navigate]);

    console.log(user)
  return (
    <div className='dashboard'>
        <h1>Dashboard</h1>
    </div>
  );
};
