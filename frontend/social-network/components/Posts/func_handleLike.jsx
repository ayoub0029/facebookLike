import { fetchApi } from "@/api/fetchApi";

export const handleLike = async (postId, isLiked , setPosts) => {
    const status = isLiked ? 0 : 1;
    await fetchApi(`/posts/reactions?post_id=${postId}&status_like=${status}`);

    try {
        const response = await fetchApi(`/post?post_id=${postId}`);

        if (response && response[0]) {

            setPosts((allPosts) =>
                allPosts.map((post) =>
                    post.id === postId ? { ...post, is_liked: response[0].is_liked, likes: response[0].likes } : post
                )
            );
        }
    } catch (err) {
        console.error("Failed to like the post", err);
    }
};