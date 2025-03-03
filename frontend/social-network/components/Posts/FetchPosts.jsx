"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/api/fetchApi";
import { formatTime } from "@/utiles/dateFormat";
import Image from "next/image";
import Modal from "../model";
import useLazyLoadById from "@/hooks/lazyloadById";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FetchPosts({ endpoint , lastId }) {
    const [editVisible, setEditVisible] = useState(null);
    const menuRef = useRef(null);

    const getInitialId = () => {
        return  parseInt(lastId);
    };

    // Function to fetch posts that will be passed to the hook
    const fetchPosts = async (lastId) => {
        try {
            const response = await fetchApi(`${endpoint}${lastId}`);
            
            if (response.status !== undefined) {
                console.error("FetchPosts: API error:", response.status, response.error);
                return { status: response.status, error: response.error };
            }
            return { 
                items: response
            };
        } catch (err) {
            console.error("FetchPosts: Error fetching:", err);
            return { status: 500, error: "Failed to fetch posts" };
        }
    };

    const { data: posts, setData: setPosts, loaderRef, loading, error, hasMore } = useLazyLoadById(fetchPosts, getInitialId());

    const [modals, setModals] = useState({
        followers: false,
        editPost: false,
        deletePost: false,
        editComment: false,
        deleteComment: false
    });
    
    const openModal = (modalName) => {
        return () => {
            setModals({ ...modals, [modalName]: true });
        };
    };
    
    const closeModal = (modalName) => {
        return () => {
            setModals({ ...modals, [modalName]: false });
        };
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setEditVisible(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (postId) => {
        setEditVisible(editVisible === postId ? null : postId);
    };

    const handleLike = async (postId, isLiked) => {
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

    const handleEdit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newContent = e.target.newContent.value;
        const response = await fetchApi("/posts/update", "PUT", formData, true);

        if (response.status != undefined) {
            alert(`Error: ${response.error} Status: ${response.status}`);
            return;
        }

        // success
        closeModal('editPost')();
        setEditVisible(null);

        setPosts((allPosts) =>
            allPosts.map((post) =>
                post.id == e.target.post_id.value ? { ...post, content: `${newContent}`, updated_at_at: `${new Date()}` } : post
            )
        );

        e.target.reset();
    }

    const handleDelete = async (e) => {
        e.preventDefault();
        const postIdToDelete = e.target.post_id.value;

        const response = await fetchApi(`/posts/delete?post_id=${postIdToDelete}`, "DELETE");

        if (response.status != undefined) {
            alert(`Error: ${response.error} Status: ${response.status}`);
            return;
        }

        // success
        setPosts((allPosts) => allPosts.filter(post => post.id != postIdToDelete));
        closeModal('deletePost')();
        setEditVisible(null);
        e.target.reset();
    }

    const PrivacyText = (privacy) => {
        privacy = privacy.privacy
        
        if (privacy === "public") {
            return (
                <>
                    <i className="fa-solid fa-globe"></i>
                    <span> public</span>
                </>
            )
        } else if (privacy === "almost private") {
            return (
                <>
                    <i className="fa-solid fa-user-group"></i>
                    <span> almost private</span>
                </>
            )
        } else {
            return (
                <>
                    <i className="fa-solid fa-lock"></i>
                    <span> private</span>
                </>
            )
        }
    };

    if (error && posts.length === 0) return <div className="error">{error}</div>;
    if (posts.length === 0 && loading) return <div>Loading posts...</div>;

    return (
        <div>
            {posts.map((post) => (
                <div key={post.id} className="post">
                    {post.edit && (
                        <>
                            <div className="editPoints" onClick={() => toggleMenu(post.id)}>...</div>
                            {editVisible === post.id && (
                                <div className="editMenu" ref={menuRef}>
                                    <div>
                                        <button className="editBtn" onClick={openModal('editPost')}>Update</button>
                                        <Modal
                                            isOpen={modals.editPost}
                                            onClose={closeModal('editPost')}
                                        >
                                            <form className="newPost" onSubmit={handleEdit}>
                                                <input type="hidden" name="post_id" value={post.id} />
                                                <textarea placeholder="Write something here..." name="newContent" defaultValue={post.content}></textarea>
                                                <button type="submit" className="btn btnGreen">Edit</button>
                                            </form>
                                        </Modal>
                                    </div>
                                    <button className="editBtn" onClick={openModal('deletePost')}>Delete</button>
                                    <Modal
                                        isOpen={modals.deletePost}
                                        onClose={closeModal('deletePost')}
                                    >
                                        <form className="newPost" onSubmit={handleDelete}>
                                            <label>Do you want to delete post : "{(post.content).slice(0, 50)}..."</label>
                                            <input type="hidden" name="post_id" value={post.id} />
                                            <div style={{ display: "flex", gap: "10px", alignItems: "end", direction: "rtl" }}>
                                                <button type="button" onClick={closeModal('deletePost')} className="btn btnGray">Cancel</button>
                                                <button type="submit" className="btn btnRed">Delete</button>
                                            </div>
                                        </form>
                                    </Modal>
                                </div>
                            )}
                        </>
                    )}

                    <div className="postHeader">
                        <Image
                            src={
                                post.avatar?.startsWith("http")
                                    ? post.avatar
                                    : (post.avatar && post.avatar !== "undefined")
                                        ? `${API_BASE_URL}/public/${post.avatar}`
                                        : "/images/test.jpg"
                            }

                            alt="Profile Image"
                            className="profileImg"
                            width={40}
                            height={40}
                            unoptimized={true}
                        />
                        <div className="postInfo">
                            <span className="postName">{post.first_name} {post.last_name}</span>
                            <span className="postTime"><PrivacyText privacy={post.privacy} />{" | " + formatTime(post.created_at) + " " + (post.updated_at_at ? `Edited : ${formatTime(post.updated_at_at)}` : "")}</span>
                        </div>
                    </div>
                    <div className="postContent">{post.content}</div>
                    <div className="postImage">
                        {post.image && post.image !== "" ? (
                            <Image
                                src={`${API_BASE_URL}/public/${post.image}`}
                                alt="Post Image"
                                width={1000}
                                height={500}
                                unoptimized={true}
                            />
                        ) : null}
                    </div>
                    <div className="postActions">
                        {post.is_liked ? (
                            <label onClick={() => handleLike(post.id, post.is_liked)}>
                                <i className="fa-solid fa-heart danger"></i> {post.likes}
                            </label>
                        ) : (
                            <label onClick={() => handleLike(post.id, post.is_liked)}>
                                <i className="fa-regular fa-heart"></i> {post.likes}
                            </label>
                        )}
                        <label><i className="fa-regular fa-comment"></i> {post.comments}</label>
                    </div>
                </div>
            ))}
            
            {/* Loader element for intersection observer */}
            {hasMore && (
                <div ref={loaderRef} className="loaderElement">
                    {loading && <div className="loading-spinner">Loading more posts...</div>}
                </div>
            )}
            
            {!hasMore && posts.length > 0 && (
                <div className="end-message">No more posts to load</div>
            )}
        </div>
    );
}