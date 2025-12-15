import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080", // chỉnh nếu BE khác cổng
});

export const setToken = (token?: string) => {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
};

export default api;