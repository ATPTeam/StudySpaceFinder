import axios from 'axios';
import { io } from 'socket.io-client';

// Use production backend URL from .env or fallback to localhost in development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Initialize Socket.io Connection
export const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling']
});

// API Helper Methods
export const fetchSpaces = (params) => apiClient.get('/spaces', { params });
export const fetchSpaceMeta = () => apiClient.get('/spaces/meta');
export const fetchSpaceDetails = (id) => apiClient.get(`/spaces/${id}`);
export const pingSpaceFreshness = (id) => apiClient.post(`/spaces/${id}/ping`);

export const loginStudent = (data) => apiClient.post('/students/login', data);
export const fetchStudentSession = (studentId) => apiClient.get(`/students/me/${studentId}`);
export const checkInSpace = (data) => apiClient.post('/students/check-in', data);
export const checkOutSpace = (data) => apiClient.post('/students/check-out', data);