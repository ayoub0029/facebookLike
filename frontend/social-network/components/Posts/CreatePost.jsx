"use client";

import { useState } from "react";
import { fetchApi } from "@/api/fetchApi";

export function CreatePost() {
  const [imagePreview, setImagePreview] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetchApi("posts", "POST", formData, true);
    if (response.status != undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }
    // success
    e.target.reset();
    setImagePreview(null);
    alert(response);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {       
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <form className="newPost" encType="multipart/form-data" onSubmit={handleCreate}>
      <textarea placeholder="Write something here..." name="content"></textarea>

      {/* Image Preview */}
      {imagePreview && (
        <div style={{ maxHeight:"200px", display:"flex" , gap:"10px" }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ maxHeight:"100%" }}
          />
          <button
            type="button"
            style={{cursor:"pointer"}}
            onClick={() => {
              setImagePreview(null);
              document.getElementById("postImage").value = "";
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="imgPrivacyPost">
        <label htmlFor="postImage" className="imageUp">
          <i className="fa-regular fa-image"></i> Image/GIF
        </label>
        <input
          type="file"
          id="postImage"
          className="imageUpload"
          accept="image/*,image/gif"
          name="image"
          onChange={handleImageChange}
        />
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