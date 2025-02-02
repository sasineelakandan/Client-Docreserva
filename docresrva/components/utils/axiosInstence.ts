// axiosInstance.js
import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
//    baseURL: 'http://localhost:8001', // Replace with your API base URL
    baseURL: 'https://api.docreserva.site',
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const accesstoken = localStorage.getItem('accesstoken'); // Adjust the key as necessary
        const refreshtoken = localStorage.getItem('refreshtoken'); // Adjust the key as necessary
        if (refreshtoken && accesstoken) {
            config.headers['accesstoken'] = `Bearer ${accesstoken}`;
            config.headers['refreshtoken'] = `Bearer ${refreshtoken}`;
        }
        console.log(config.headers,"config.headers")
        return config; // Return the modified config
    },
    (error) => {
        // Handle the error
        return Promise.reject(error);
    }
);


export default axiosInstance;