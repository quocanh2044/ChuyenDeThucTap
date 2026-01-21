import axios from "axios";

// 🟢 SỬA TẠI ĐÂY: Ưu tiên dùng biến môi trường, nếu không có mới dùng localhost
const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/users` 
    : "https://chuyendethuctap-evf7.onrender.com/api/users";

export const getUserProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("NO TOKEN");
    }

    const res = await axios.get(`${API_URL}/profile`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return res.data;
};