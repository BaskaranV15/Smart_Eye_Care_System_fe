import React, { useEffect, useState } from 'react';
import AuthService from '../services/auth.service';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
        } else {
            setUser(currentUser);
            if (currentUser.role === 'DOCTOR') navigate('/doctor');
            else if (currentUser.role === 'PATIENT') navigate('/patient');
            else if (currentUser.role === 'ADMIN') navigate('/admin');
        }
    }, [navigate]);

    return null;
};

export default Dashboard;
