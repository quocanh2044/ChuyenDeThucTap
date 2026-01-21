// src/services/aiService.ts

import axios from "axios";

export async function searchMoviesAI(query: string) {
    const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/ai/movies/search`,
        {
            params: { q: query },
        }
    );
    return res.data;
}
