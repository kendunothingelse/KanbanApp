import axios from 'axios';

// Define the base URL for your Spring Boot application
const API_BASE_URL = 'http://localhost:8080/api';

// Create an axios instance with the base URL
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//This function adds the JWT token to the Authorization header of each request if it exists in localStorage
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});


export default apiClient;