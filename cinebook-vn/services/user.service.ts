import axios from "axios";

const API_URL = "http://localhost:5001/api/users";

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
