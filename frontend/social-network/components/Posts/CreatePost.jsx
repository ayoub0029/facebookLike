"use client";

import { fetchApi } from "@/api/fetchApi";

export function CreatePost() {
  const hundleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target)
    const response = await fetchApi("posts", "POST", formData, true)
    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return
    }
    //succes
    e.target.reset()
    alert(response)
  }
  return (
    <form className="newPost" encType="multipart/form-data" onSubmit={hundleCreate}>
      <textarea placeholder="Write something here..." name="content"></textarea>
      <div className="imgPrivacyPost">
        <label htmlFor="postImage" className="imageUp">
          <i className="fa-regular fa-image"></i> Image/GIF
        </label>
        <input type="file" id="postImage" className="imageUpload" accept="image/*,image/gif" name="image" />
        <select id="privacy" name="privacy">
          <option value="public">Public</option>
          <option value="almost private">Almost Private (followers only)</option>
          <option value="private">Private (selected followers)</option>
        </select>
      </div>
      <button type="submit" className="btn btnGreen">Post</button>
    </form>
  );
}
