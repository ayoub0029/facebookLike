import { fetchApi } from "@/api/fetchApi";

export async function fetchBylastId(lastId, endpoint) {
    try {
        const response = await fetchApi(`${endpoint}${lastId}`);

        if (response && response.status !== undefined) {
            return { status: response.status, error: response.error };
        }

        const items = Array.isArray(response) ? response : [];

        return {
            items: response
        };
    } catch (err) {
        return { status: 500, error: "Failed to fetch posts" };
    }
};