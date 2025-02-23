"use client";

import { fetchApi } from "@/api/fetchApi";

export function CreatePost() {
  const hundleCreate = async (e) => {
    e.preventDefault();
    // const formData = new FormData(e.target)
    // const response = await fetchApi("POST", "posts", formData, true)
    const response2 = await fetchApi("posts?last_id=0")

    // console.log(response);
    console.log(response2);
    
  }
  return (
    <form className="newPost" encType="multipart/form-data" onSubmit={hundleCreate}>
      <textarea placeholder="Write something here..." name="postContent"></textarea>
      <div className="imgPrivacyPost">
        <label htmlFor="postImage" className="imageUp">
          <i className="fa-regular fa-image"></i> Image/GIF
        </label>
        <input type="file" id="postImage" className="imageUpload" accept="image/*,image/gif" name="postImage" />
        <select id="privacy" name="privacy">
          <option value="public">Public</option>
          <option value="almostPrivate">Almost Private (followers only)</option>
          <option value="private">Private (selected followers)</option>
        </select>
      </div>
      <button type="submit" className="btn btnGreen">Post</button>
    </form>
  );
}
