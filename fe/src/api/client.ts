import axios from "axios";

const client = axios.create({
    baseURL: "http://localhost:8080", // đổi nếu backend khác host/port
});

// Đính kèm JWT từ localStorage
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default client;