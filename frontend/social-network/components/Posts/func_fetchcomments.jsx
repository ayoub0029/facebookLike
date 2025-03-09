import { fetchApi } from "@/api/fetchApi";

export async function fetchComments(lastCommentId = 0 , postId) {
    try {
        const response = await fetchApi(`posts/comments?post_id=${postId}&last_id=${lastCommentId}`);

        if (response && response.status !== undefined) {
            return { status: response.status, error: response.error };
        }

        const items = Array.isArray(response) ? response : [];

        return {
            items: response
        };
    } catch (err) {
        return { status: 500, error: "Failed to fetch comments" };
    }
};