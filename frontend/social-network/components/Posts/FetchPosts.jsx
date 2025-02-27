"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/api/fetchApi";
import Image from "next/image";

export function FetchPosts({ last_id = 0 }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPosts() {
            try {
                const response = await fetchApi(`posts?last_id=${last_id}`);                

                if (response.status !== undefined) {
                    setError(`Error: ${response.error} (Status: ${response.status})`);
                    return;
                }

                if (response) {
                    setPosts(response); 
                }
            } catch (err) {
                setError("No posts to fetch.");
            }
        }

        loadPosts();
    }, [last_id]);

    if (error) return <div className="error">{error}</div>;
    if (posts.length === 0) return <div>Loading posts...</div>;

    return (
        <div>
            {posts.map((post) => (
                <div key={post.id} className="post">
                    <div className="postHeader">
                        {/* <Image src={post.avatar} alt="Profile Image" className="profileImg" width={50} height={50} /> */}
                        <div className="postInfo">
                            <span className="postName">{post.first_name} {post.last_name}</span>
                            <span className="postTime">{post.created_at}</span>
                        </div>
                    </div>
                    <div className="postContent">{post.content}</div>
                    {/* <Image src={post.image} alt="Post Image" className="postImage" width={300} height={200} /> */}
                    <div className="postActions">
                        <label><i className="fa-regular fa-heart"></i> {post.likes}</label>
                        <label><i className="fa-regular fa-comment"></i> {post.comments}</label>
                    </div>
                </div>
            ))}
        </div>
    );
}
