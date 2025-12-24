import api from './api';
import { jwtDecode } from "jwt-decode";

const login = async (username, password) => {
    const response = await api.post('http://localhost:9090/api/auth/login', { userName:username, password });
    if (response.data.token) {
        const decoded = jwtDecode(response.data.token);
        const user = {
            token: response.data.token,
            ...decoded
        };
        localStorage.setItem('user', JSON.stringify(user));
        return user;
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
    login,
    logout,
    getCurrentUser,
};

export default AuthService;
