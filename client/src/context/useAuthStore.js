import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    register: async (userData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/auth/register', userData);
            const { token, ...user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            set({ user, token, isAuthenticated: true, isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: (newUser) => {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...currentUser, ...newUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
    }
}));

export default useAuthStore;
