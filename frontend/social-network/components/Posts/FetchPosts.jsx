"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi } from "@/api/fetchApi";
import { formatTime } from "@/utiles/dateFormat";
import { fetchBylastId } from "./func_fetchposts";
import { handleLike } from "./func_handleLike";
import { PrivacyText } from "./func_privateText";
import { fetchComments } from "./func_fetchcomments";
import Modal from "../model";
import useLazyLoadById from "@/hooks/lazyloadById";
import { SkeletonLoaderPosts } from "@/components/skeletons/profile_skel.jsx";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function FetchPosts({ endpoint, lastId }) {
  const [editVisible, setEditVisible] = useState(null);
  const [editCommentVisible, setEditCommentVisible] = useState(null);
  const menuRef = useRef(null);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

  const {
    data: posts,
    setData: setPosts,
    loaderRef,
    loading,
    error,
    hasMore,
  } = useLazyLoadById(fetchBylastId, parseInt(lastId), endpoint, "");

  const {
    data: comments,
    setData: setComments,
    loaderRef: commentsLoaderRef,
    loading: commentsLoading,
    error: commentsError,
    hasMore: hasMoreComments,
    reset: resetComments,
  } = useLazyLoadById(fetchComments, 0, "", openCommentsPostId, false);

  const initialLoad = async (postId) => {
    const result = await fetchComments(0, postId);
    if (result.items && result.items.length > 0) {
      setComments(result.items);
    }
  };

  const toggleComments = (postId) => {
    if (!postId || postId === 0) {
      console.error("Invalid post ID for fetching comments");
      return;
    }

    if (openCommentsPostId === postId) {
      setOpenCommentsPostId(null);
      resetComments();
    } else {
      setOpenCommentsPostId(postId);
      resetComments();
      initialLoad(postId);
    }
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
    setEditCommentVisible(null)
  };
  const togglecommentMenu = (commentId) => {
    setEditCommentVisible(editVisible === commentId ? null : commentId);
    setEditVisible(null)
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newContent = e.target.newContent.value;
    const response = await fetchApi("/posts/update", "PUT", formData, true);

    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // success
    closeModal("editPost")();
    setEditVisible(null);

    setPosts((allPosts) =>
      allPosts.map((post) =>
        post.id == e.target.post_id.value
          ? {
              ...post,
              content: `${newContent}`,
              updated_at_at: `${new Date()}`,
            }
          : post
      )
    );

    e.target.reset();
  };

  const handleEditComment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newContent = e.target.newContent.value;
    const response = await fetchApi(
      "/posts/comments/update",
      "PUT",
      formData,
      true
    );

    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // success
    closeModal("editPost")();
    setEditCommentVisible(null);
    setComments((allComments) =>
      allComments.map((comment) =>
        comment.id == e.target.comment_id.value
          ? {
              ...comment,
              comment_content: `${newContent}`,
            }
          : comment
      )
    );
    e.target.reset();
  };

  const handleDeletePost = async (e) => {
    e.preventDefault();
    const postIdToDelete = e.target.post_id.value;

    const response = await fetchApi(
      `/posts/delete?post_id=${postIdToDelete}`,
      "DELETE"
    );

    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // success
    setPosts((allPosts) =>
      allPosts.filter((post) => post.id != postIdToDelete)
    );
    closeModal("deletePost")();
    setEditVisible(null);
    e.target.reset();
  };

  const handleDeleteComment = async (e) => {
    e.preventDefault();
    const CommentIdToDelete = e.target.comment_id.value;

    const response = await fetchApi(
      `/posts/comments/delete?comment_id=${CommentIdToDelete}`,
      "DELETE"
    );

    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // success
    setComments((allComments) =>
      allComments.filter((comment) => comment.id != CommentIdToDelete)
    );
    closeModal("deletePost")();
    setEditVisible(null);
    e.target.reset();
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetchApi("posts/comments", "POST", formData, true);
    const postId = e.target.post_id.value;

    if (response.status !== undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // Success
    e.target.reset();
    initialLoad(postId);
  };

  const [modals, setModals] = useState({
    followers: false,
    editPost: false,
    deletePost: false,
    editComment: false,
    deleteComment: false,
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

  if (error && posts.length === 0) return <div className="error">{error}</div>;
  // if (posts.length === 0 && loading) return <div>Loading posts...</div>;
  if (posts.length === 0 && loading) return <SkeletonLoaderPosts />;

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="post">
          {post.edit && (
            <>
              <div className="editPoints" onClick={() => toggleMenu(post.id)}>
                ...
              </div>
              {editVisible === post.id && (
                <div className="editMenu" ref={menuRef}>
                  <div>
                    <button className="editBtn" onClick={openModal("editPost")}>
                      Update
                    </button>
                    <Modal
                      isOpen={modals.editPost}
                      onClose={closeModal("editPost")}
                      title="Edit Post"
                    >
                      <form className="newPost" onSubmit={handleEditPost}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <textarea
                          placeholder="Write something here..."
                          name="newContent"
                          defaultValue={post.content}
                        ></textarea>
                        <button type="submit" className="btn btnGreen">
                          Edit
                        </button>
                      </form>
                    </Modal>
                  </div>
                  <button className="editBtn" onClick={openModal("deletePost")}>
                    Delete
                  </button>
                  <Modal
                    isOpen={modals.deletePost}
                    onClose={closeModal("deletePost")}
                    title="Delete Post"
                  >
                    <form className="newPost" onSubmit={handleDeletePost}>
                      <label>
                        Do you want to delete post : "
                        {post.content.slice(0, 50)}..."
                      </label>
                      <input type="hidden" name="post_id" value={post.id} />
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "end",
                          direction: "rtl",
                        }}
                      >
                        <button
                          type="button"
                          onClick={closeModal("deletePost")}
                          className="btn btnGray"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btnRed">
                          Delete
                        </button>
                      </div>
                    </form>
                  </Modal>
                </div>
              )}
            </>
          )}

          <div className="postHeader">
            <Link
              href={"/profile/" + post.user_id}
              className="primary"
              style={{ textDecoration: "none" }}
            >
              <Image
                src={
                  post.avatar?.startsWith("http")
                    ? post.avatar
                    : post.avatar && post.avatar !== "undefined"
                    ? `${API_BASE_URL}/public/${post.avatar}`
                    : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
                }
                alt="Profile Image"
                className="profileImg"
                width={40}
                height={40}
                unoptimized={true}
              />
            </Link>

            <div className="postInfo">
              <span className="postName">
                {post.first_name} {post.last_name}
              </span>
              <span className="postTime">
                <PrivacyText privacy={post.privacy} />
                {" | " +
                  formatTime(post.created_at) +
                  " " +
                  (post.updated_at_at
                    ? `Edited : ${formatTime(post.updated_at_at)}`
                    : "")}
              </span>
            </div>
          </div>
          <div className="postContent">{post.content}</div>
          <div className="postImage">
            {post.image && post.image !== "" ? (
              <Image
                src={`${API_BASE_URL}/public/${post.image}`}
                alt="Post Image"
                layout="responsive"
                width={1000}
                height={500}
                unoptimized={true}
                objectFit="cover"
              />
            ) : null}
          </div>
          <div className="postActions">
            {post.is_liked ? (
              <label
                onClick={() => handleLike(post.id, post.is_liked, setPosts)}
              >
                <i className="fa-solid fa-heart danger"></i> {post.likes}
              </label>
            ) : (
              <label
                onClick={() => handleLike(post.id, post.is_liked, setPosts)}
              >
                <i className="fa-regular fa-heart"></i> {post.likes}
              </label>
            )}
            <label onClick={() => toggleComments(post.id)}>
              <i className="fa-regular fa-comment"></i> {post.comments}
            </label>
          </div>

          {/* Comments Section */}
          {openCommentsPostId === post.id && (
            <div className="commentsSection">
              <form
                className="newComment"
                encType="multipart/form-data"
                onSubmit={handleCreateComment}
              >
                <Image
                  src={
                    window.userState.avatar?.startsWith("http")
                      ? window.userState.avatar
                      : window.userState.avatar &&
                        window.userState.avatar !== "undefined"
                      ? `${API_BASE_URL}/public/${window.userState.avatar}`
                      : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
                  }
                  alt="Your Profile"
                  className="smallImg"
                  width={40}
                  height={40}
                  unoptimized={true}
                />
                <label
                  htmlFor="commentImageUpload"
                  className="commentImageLabel"
                >
                  <i className="fa-regular fa-image"></i>
                </label>
                <input type="hidden" name="post_id" value={post.id} />
                <input
                  type="file"
                  id="commentImageUpload"
                  name="image"
                  className="commentImageUpload"
                  accept="image/*"
                />
                <div className="commentInputContainer">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    name="content"
                    className="commentInput"
                    required
                  />
                  <button className="btnComment">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>

              <div className="comments">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment commentWithImage">
                    <Link
                      href={"/profile/" + comment.user_id}
                      className="primary"
                      style={{ textDecoration: "none" }}
                    >
                      <Image
                        src={
                          comment.avatar?.startsWith("http")
                            ? comment.avatar
                            : comment.avatar && comment.avatar !== "undefined"
                            ? `${API_BASE_URL}/public/${comment.avatar}`
                            : `${process.env.NEXT_PUBLIC_GLOBAL_IMG}`
                        }
                        alt="Commenter Profile"
                        className="smallImg"
                        width={40}
                        height={40}
                        unoptimized={true}
                      />
                    </Link>
                    <div className="commentContent">
                      {comment.user_id === window.userState.id && (
                      <div
                        className="editPointContainer"
                        onClick={() => togglecommentMenu(comment.id)}
                      >
                        <div className="editPoint">•••</div>
                        {editCommentVisible === comment.id && (
                          <div className="editMenu" ref={menuRef}>
                            <div>
                              <button
                                className="editBtn"
                                onClick={openModal("editPost")}
                              >
                                Update
                              </button>
                              <Modal
                                isOpen={modals.editPost}
                                onClose={closeModal("editPost")}
                                title="Edit comment"
                              >
                                <form
                                  className="newPost"
                                  onSubmit={handleEditComment}
                                >
                                  <input
                                    type="hidden"
                                    name="comment_id"
                                    value={comment.id}
                                  />
                                  <textarea
                                    placeholder="Write something here..."
                                    name="newContent"
                                    defaultValue={comment.comment_content}
                                  ></textarea>
                                  <button
                                    type="submit"
                                    className="btn btnGreen"
                                  >
                                    Edit
                                  </button>
                                </form>
                              </Modal>
                            </div>
                            <button
                              className="editBtn"
                              onClick={openModal("deletePost")}
                            >
                              Delete
                            </button>
                            <Modal
                              isOpen={modals.deletePost}
                              onClose={closeModal("deletePost")}
                              title="Delete Comment"
                            >
                              <form
                                className="newPost"
                                onSubmit={handleDeleteComment}
                              >
                                <label>
                                  Do you want to delete comment : "
                                  {comment.comment_content.slice(0, 50)}..."
                                </label>
                                <input
                                  type="hidden"
                                  name="comment_id"
                                  value={comment.id}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "end",
                                    direction: "rtl",
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={closeModal("deletePost")}
                                    className="btn btnGray"
                                  >
                                    Cancel
                                  </button>
                                  <button type="submit" className="btn btnRed">
                                    Delete
                                  </button>
                                </div>
                              </form>
                            </Modal>
                          </div>
                        )}
                      </div>
                      )}
                      <span className="commentName">
                        {comment.first_name + " " + comment.last_name}
                      </span>
                      <p>{comment.comment_content}</p>
                      {comment.image && (
                        <Image
                          src={`${API_BASE_URL}/public/${comment.image}`}
                          alt="Comment Image"
                          className="commentImage"
                          layout="responsive"
                          width={500}
                          height={300}
                          unoptimized={true}
                          objectFit="cover"
                        />
                      )}
                      <span className="commentTime">
                        {formatTime(comment.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {hasMoreComments && (
                <div ref={commentsLoaderRef} className="loaderElement">
                  {commentsLoading && (
                    <div className="loading-spinner">
                      Loading more comments...
                    </div>
                  )}
                </div>
              )}

              {!hasMoreComments && comments.length > 0 && (
                <div className="end-message">No more comments to load</div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Existing posts loader */}
      {hasMore && (
        <div ref={loaderRef} className="loaderElement">
          {loading && (
            <div className="loading-spinner">Loading more posts...</div>
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="end-message">No more posts to load</div>
      )}
    </div>
  );
}