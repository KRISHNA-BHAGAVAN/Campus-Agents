import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [workspace, setWorkspace] = useState(JSON.parse(localStorage.getItem('workspace')));
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (workspace) {
            localStorage.setItem('workspace', JSON.stringify(workspace));
        } else {
            localStorage.removeItem('workspace');
        }
    }, [workspace]);

    // Check auth on load
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const res = await axios.get('http://localhost:8000/auth/me');
                    setUser(res.data);
                } catch (err) {
                    console.error("Auth check failed", err);
                    logout();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, [token]);

    const login = async (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await axios.post('http://localhost:8000/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        setToken(res.data.access_token);
        // Fetch user details immediately after login to populate user state
        const userRes = await axios.get('http://localhost:8000/auth/me', {
            headers: { 'Authorization': `Bearer ${res.data.access_token}` }
        });
        setUser(userRes.data);
        return true;
    };

    const register = async (email, fullName, password) => {
        const res = await axios.post('http://localhost:8000/auth/register', {
            email,
            full_name: fullName,
            password
        });
        setToken(res.data.access_token);
        const userRes = await axios.get('http://localhost:8000/auth/me', {
            headers: { 'Authorization': `Bearer ${res.data.access_token}` }
        });
        setUser(userRes.data);
        return true;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setWorkspace(null);
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
        localStorage.removeItem('workspace');
    };

    const selectWorkspace = (ws) => {
        setWorkspace(ws);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            workspace,
            login,
            register,
            logout,
            selectWorkspace,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
