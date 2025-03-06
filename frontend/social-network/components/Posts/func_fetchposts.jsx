import { fetchApi } from "@/api/fetchApi";

export async function fetchPosts(lastId, endpoint) {
    try {
        const response = await fetchApi(`${endpoint}${lastId}`);

        if (response && response.status !== undefined) {
            // console.error("FetchPosts: API error:", response.status, response.error);
            return { status: response.status, error: response.error };
        }

        const items = Array.isArray(response) ? response : [];

        return {
            items: response
        };
    } catch (err) {
        // console.error("FetchPosts: Error fetching:", err);
        return { status: 500, error: "Failed to fetch posts" };
    }
};

