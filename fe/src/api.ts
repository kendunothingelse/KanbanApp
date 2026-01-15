import axios from "axios";

const api = axios. create({
    baseURL: "http://localhost:8080",
});

// Request interceptor - thêm token vào header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - bắt lỗi 401 và redirect
api.interceptors.response.use(
    (response) => {
        // Response thành công, trả về như bình thường
        return response;
    },
    (error) => {
        // Xử lý lỗi response
        if (error.response) {
            const { status, data } = error.response;

            // Token hết hạn hoặc không hợp lệ
            if (status === 401) {
                console.error("❌ Phiên đăng nhập hết hạn:", data?. message || "Unauthorized");

                // Xóa thông tin đăng nhập cũ
                localStorage.removeItem("token");
                localStorage.removeItem("username");

                // Redirect về trang login
                // Kiểm tra để tránh loop vô hạn
                if (window. location.pathname !== "/login") {
                    window.location.href = "/login";
                }

                return Promise.reject(new Error("Token hết hạn.  Vui lòng đăng nhập lại."));
            }

            // Lỗi 403 - Forbidden
            if (status === 403) {
                console.error("❌ Không có quyền truy cập");
                return Promise.reject(new Error(data?.message || "Bạn không có quyền thực hiện thao tác này"));
            }

            // Lỗi 404
            if (status === 404) {
                return Promise.reject(new Error(data?.message || "Không tìm thấy tài nguyên"));
            }

            // Lỗi server 500
            if (status >= 500) {
                return Promise.reject(new Error("Lỗi server.  Vui lòng thử lại sau. "));
            }

            // Các lỗi khác
            return Promise.reject(new Error(data?.message || data || "Có lỗi xảy ra"));
        }

        // Lỗi network hoặc không có response
        if (error.request) {
            console.error("❌ Lỗi kết nối:", error.message);
            return Promise.reject(new Error("Không thể kết nối đến server.  Kiểm tra kết nối mạng."));
        }

        // Lỗi khác
        return Promise.reject(error);
    }
);

export default api;