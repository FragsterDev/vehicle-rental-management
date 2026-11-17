import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach Authorization token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// AUTH SERVICES
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// VEHICLE SERVICES
export const getVehicles = async (type = '', available = '', search = '') => {
  let url = '/vehicles';
  const params = [];
  if (type && type !== 'All') params.push(`type=${encodeURIComponent(type)}`);
  if (available && available !== 'All') {
    params.push(`available=${available === 'Available' ? 'true' : 'false'}`);
  }
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (params.length > 0) url += `?${params.join('&')}`;

  const response = await api.get(url);
  return response.data.data;
};

export const addVehicle = async (vehicleData) => {
  const response = await api.post('/vehicles', vehicleData);
  return response.data.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/vehicles/${id}`, vehicleData);
  return response.data.data;
};

export const toggleVehicleAvailability = async (id) => {
  const response = await api.patch(`/vehicles/${id}/toggle-availability`);
  return response.data.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};

// BOOKING / RENTAL SERVICES
export const rentVehicle = async ({
  vehicleId,
  bookingDate,
  returnDate,
  days,
  deliveryAddress,
  paymentMethod,
  paymentId,
  orderId,
}) => {
  const response = await api.post('/bookings', {
    vehicleId,
    bookingDate,
    returnDate,
    days,
    deliveryAddress,
    paymentMethod,
    paymentId,
    orderId,
  });
  return response.data;
};

export const getMyRentals = async () => {
  const response = await api.get('/bookings/my-rentals');
  return response.data.data;
};

export const getAllBookings = async () => {
  const response = await api.get('/bookings');
  return response.data.data;
};

export const returnVehicle = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/return`);
  return response.data;
};

// NOTIFICATION SERVICES (ADMIN)
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
