import axios from 'axios'

// Base URL - thay đổi theo môi trường
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Tạo axios instance
const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - Thêm token vào mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Xử lý lỗi và refresh token
axiosInstance.interceptors.response.use(
    (response) => {
        return response
    },
    async (error) => {
        const originalRequest = error.config

        // Nếu lỗi 401 và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')

                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                // Gọi API refresh token
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                const { accessToken } = response.data

                // Lưu token mới
                localStorage.setItem('accessToken', accessToken)

                // Retry request với token mới
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return axiosInstance(originalRequest)
            } catch (refreshError) {
                // Nếu refresh token thất bại, logout
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default axiosInstance
