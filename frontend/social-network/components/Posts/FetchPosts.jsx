"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/api/fetchApi";
import { formatTime } from "@/utiles/dateFormat";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FetchPosts({ endpoint, edit = false }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [menuVisible, setMenuVisible] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        async function loadPosts() {
            try {
                const response = await fetchApi(endpoint);

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
    }, [endpoint]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuVisible(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (postId) => {
        setMenuVisible(menuVisible === postId ? null : postId);
    };

    if (error) return <div className="error">{error}</div>;
    if (posts.length === 0) return <div>Loading posts...</div>;

    return (
        <div>
            {posts.map((post) => (
                <div key={post.id} className="post">
                    {edit && (
                        <>
                            <div className="editPoints" onClick={() => toggleMenu(post.id)}>...</div>
                            {menuVisible === post.id && (
                                <div className="editMenu" ref={menuRef}>
                                    <button onClick={() => alert("Update" + post.id)}>Update</button>
                                    <button onClick={() => alert("Delete" + post.id)}>Delete</button>
                                </div>
                            )}
                        </>
                    )}

                    <div className="postHeader">
                        <Image
                            src={
                                post.avatar?.startsWith("http")
                                    ? post.avatar
                                    : post.avatar
                                        ? `${API_BASE_URL}/public/${post.avatar}`
                                        : "/images/test.jpg"
                            }

                            alt="Profile Image"
                            className="profileImg"
                            width={40}
                            height={40}
                        />
                        <div className="postInfo">
                            <span className="postName">{post.first_name} {post.last_name}</span>
                            <span className="postTime">{formatTime(post.created_at)}</span>
                        </div>
                    </div>
                    <div className="postContent">{post.content}</div>
                    <div className="postImage">
                        {post.image && post.image !== "" ? (
                            <Image
                                src={`${API_BASE_URL}/public/${post.image}`}
                                alt="Post Image"
                                layout="responsive"
                                width={500}
                                height={500}
                            />
                        ) : null}
                    </div>
                    <div className="postActions">
                        <label><i className="fa-regular fa-heart"></i> {post.likes}</label>
                        <label><i className="fa-regular fa-comment"></i> {post.comments}</label>
                    </div>
                </div>
            ))}
        </div>
    );
}
