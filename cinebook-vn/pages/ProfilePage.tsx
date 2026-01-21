import React, { useEffect, useState } from "react";
import UserProfile from "../components/UserProfile";
import { getUserProfile } from "../services/user.service";
import { UserProfile as UserProfileType } from "../types";

const ProfilePage: React.FC = () => {
    const [user, setUser] = useState<UserProfileType | null>(null);
    const userId = 1; // 🔥 sau này lấy từ JWT

    useEffect(() => {
        getUserProfile(userId)
            .then(setUser)
            .catch((err) => {
                console.error(err);
                setUser(null);
            });
    }, []);

    if (!user) {
        return <div className="text-center py-20 text-gray-400">Loading...</div>;
    }

    return <UserProfile user={user} />;
};

export default ProfilePage;
