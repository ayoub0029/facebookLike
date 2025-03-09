"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/api/fetchApi";
import Modal from "../model";
import { CheckBoxUsersFollowers } from "./CheckBoxFollowers";

export function CreatePost({ onSuccess }) {
  const [modals, setModals] = useState({
    private: false,
  });
  const [selectedPrivacy, setSelectedPrivacy] = useState("public");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const closeModal = (modalName) => () => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
  };

  const handlePrivacyChange = (e) => {
    const value = e.target.value;
    setSelectedPrivacy(value);

    if (value === "private") {
      setModals((prev) => ({ ...prev, private: true }));
    }
  };

  const [imagePreview, setImagePreview] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    if (selectedPrivacy === "private" && selectedUsers.length > 0) {
      const existingEntries = formData.getAll("allowedUsers");
      for (let i = 0; i < existingEntries.length; i++) {
        formData.delete("allowedUsers");
      }

      selectedUsers.forEach((userId) => {
        formData.append("allowedUsers", userId);
      });
    }

    const response = await fetchApi("posts", "POST", formData, true);

    if (response.status !== undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // Success
    e.target.reset();
    setImagePreview(null);
    setSelectedUsers([]);
    onSuccess();
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

  const handleSelectedUsersChange = (userIds) => {
    setSelectedUsers(userIds);
  };

  return (
    <>
      <form
        className="newPost"
        encType="multipart/form-data"
        onSubmit={handleCreate}
      >
        <textarea
          placeholder="Write something here..."
          name="content"
        ></textarea>

        {imagePreview && (
          <div style={{ maxHeight: "200px", display: "flex", gap: "10px" }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{ maxHeight: "100%" }}
            />
            <button
              type="button"
              style={{ cursor: "pointer" }}
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
          <select id="privacy" name="privacy" onChange={handlePrivacyChange}>
            <option value="public">Public</option>
            <option value="almost private">
              Almost Private (followers only)
            </option>
            <option value="private">Private (selected followers)</option>
          </select>

          <Modal
            isOpen={modals.private}
            onClose={closeModal("private")}
            title="Choose Users"
          >
            <CheckBoxUsersFollowers
              onSelectedUsersChange={handleSelectedUsersChange}
            />
          </Modal>
        </div>

        {/* Hidden inputs for selected users */}
        {selectedUsers.map((userId) => (
          <input
            key={userId}
            type="hidden"
            name="allowedUsers"
            value={userId}
          />
        ))}

        <button type="submit" className="btn btnGreen">
          Post
        </button>
      </form>
    </>
  );
}
