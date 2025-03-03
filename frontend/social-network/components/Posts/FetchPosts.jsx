"use client";

import { useState, useEffect, useRef } from "react";
import { fetchApi } from "@/api/fetchApi";
import { formatTime } from "@/utiles/dateFormat";
import Image from "next/image";
import Modal from "../model";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FetchPosts({ endpoint }) {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState(null);
    const [editVisible, setEditVisible] = useState(null);
    const menuRef = useRef(null);

    // for edit post
    const [isModalEdit, setIsModalEdit] = useState(false);
    const openModal = () => setIsModalEdit(true);
    const closeModal = () => setIsModalEdit(false);

    // for delete post
    const [isModalDelete, setIsModalDelete] = useState(false);
    const openModalDelete = () => setIsModalDelete(true);
    const closeModalDelete = () => setIsModalDelete(false);

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
                console.log(response[0]);

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
        closeModal();
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
        closeModalDelete();
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

    if (error) return <div className="error">{error}</div>;
    if (posts.length === 0) return <div>Loading posts...</div>;

    return (
        <div>
            {console.log(posts)}
            {posts.map((post) => (
                <div key={post.id} className="post">
                    {post.edit && (
                        <>
                            <div className="editPoints" onClick={() => toggleMenu(post.id)}>...</div>
                            {editVisible === post.id && (
                                <div className="editMenu" ref={menuRef}>
                                    <div>
                                        <button className="editBtn" onClick={openModal}>Update</button>
                                        <Modal
                                            isOpen={isModalEdit}
                                            onClose={closeModal}
                                        >
                                            <form className="newPost" onSubmit={handleEdit}>
                                                <input type="hidden" name="post_id" value={post.id} />
                                                <textarea placeholder="Write something here..." name="newContent" defaultValue={post.content}></textarea>
                                                <button type="submit" className="btn btnGreen">Edit</button>
                                            </form>
                                        </Modal>
                                    </div>
                                    <button className="editBtn" onClick={openModalDelete}>Delete</button>
                                    <Modal
                                        isOpen={isModalDelete}
                                        onClose={closeModalDelete}
                                    >
                                        <form className="newPost" onSubmit={handleDelete}>
                                            <label>Do you want to delete post : "{(post.content).slice(0, 50)}..."</label>
                                            <input type="hidden" name="post_id" value={post.id} />
                                            <div style={{ display: "flex", gap: "10px", alignItems: "end", direction: "rtl" }}>
                                                <button type="button" onClick={closeModalDelete} className="btn btnGray">Cancel</button>
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
        </div>
    );
}