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

export default apiClient;