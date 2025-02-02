// axiosInstance.js
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    // baseURL: 'http://localhost:8001'
    baseURL: 'https://api.docreserva.site',
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        
        return config; 
    },
    (error) => {
        // Handle the error
        return Promise.reject(error);
    }
);


export default axiosInstance;