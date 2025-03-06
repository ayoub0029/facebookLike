import { fetchApi } from "@/api/fetchApi";

export async function fetchComments(lastCommentId = 0 , postId) {
    try {
        const response = await fetchApi(`posts/comments?post_id=${postId}&last_id=${lastCommentId}`);

        if (response && response.status !== undefined) {
            // console.error("FetchComments: API error:", response.status, response.error);
            return { status: response.status, error: response.error };
        }

        const items = Array.isArray(response) ? response : [];

        return {
            items: response
        };
    } catch (err) {
        // console.error("FetchComments: Error fetching:", err);
        return { status: 500, error: "Failed to fetch comments" };
    }
};