"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/api/fetchApi";
import useLazyLoad from "@/hooks/lazyload";
import { FetchFollowers } from "./fetchFollowers";

const HandlePrivate = ({ onFollowersSelect, privacyOption }) => {
  const { data, loaderRef, loading, error, nextPage } = useLazyLoad(FetchFollowers);
  const [selectedFollowers, setSelectedFollowers] = useState([]);

  const toggleFollower = (followerId) => {
    setSelectedFollowers(prev => {
      if (prev.includes(followerId)) {
        return prev.filter(id => id !== followerId);
      } else {
        return [...prev, followerId];
      }
    });
  };

  // Update parent component when selection changes
  useEffect(() => {
    if (onFollowersSelect) {
      onFollowersSelect(selectedFollowers);
    }
  }, [selectedFollowers, onFollowersSelect]);

  // Only show followers selection if privacy is set to private
  if (privacyOption !== 'private') {
    return null;
  }

  return (
    <div className="userGroups-container">
      <h2 className="titleGrp">Select Followers</h2>
      {error && <p className="error-message">{error}</p>}
      {loading && data.length === 0 && (
        <p className="loading-message">Loading followers...</p>
      )}
      {!error && data.length === 0 && !loading && (
        <p className="no-groups">No followers found</p>
      )}
      <div className="followers-list">
        {data.map((follower) => (
          <div key={follower.id || `follower-${follower.FirstName}-${Math.random()}`} className="follower-item">
            <input
              type="checkbox"
              id={`follower-${follower.id}`}
              checked={selectedFollowers.includes(follower.id)}
              onChange={() => toggleFollower(follower.id)}
              name="allowedUsers"
              value={follower.id}
            />
            <label htmlFor={`follower-${follower.id}`}>
              {follower.FirstName + " " + follower.LastName}
            </label>
          </div>
        ))}
      </div>
      {selectedFollowers.length > 0 && (
        <div className="selected-info">
          <span>{selectedFollowers.length} follower(s) selected</span>
        </div>
      )}
      {loading && nextPage !== null && (
        <p className="loading-more">Loading more followers...</p>
      )}
      <div ref={loaderRef}></div>
    </div>
  );
};

export function CreatePost({ onSuccess }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [privacyOption, setPrivacyOption] = useState("public");
  const [selectedFollowers, setSelectedFollowers] = useState([]);

  const handlePrivacyChange = (e) => {
    setPrivacyOption(e.target.value);
  };

  const handleFollowersSelect = (followers) => {
    setSelectedFollowers(followers);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Add selected followers to form data if privacy is set to private
    if (privacyOption === 'private' && selectedFollowers.length > 0) {
      formData.append('allowedUsers', JSON.stringify(selectedFollowers));
    }
    
    const response = await fetchApi("posts", "POST", formData, true);

    if (response.status !== undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }

    // Success
    e.target.reset();
    setImagePreview(null);
    setSelectedFollowers([]);
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
          <select 
            id="privacy" 
            name="privacy" 
            value={privacyOption}
            onChange={handlePrivacyChange}
          >
            <option value="public">Public</option>
            <option value="almost private">
              Almost Private (followers only)
            </option>
            <option value="private">Private (selected followers)</option>
          </select>
        </div>
        
        {/* Only show followers selection for private posts */}
        <HandlePrivate 
          onFollowersSelect={handleFollowersSelect} 
          privacyOption={privacyOption} 
        />
        
        {selectedFollowers.length > 0 && privacyOption === 'private' && (
          <div className="selectedFollowersInfo">
            <span>{selectedFollowers.length} followers selected</span>
          </div>
        )}
        
        <button type="submit" className="btn btnGreen">
          Post
        </button>
      </form>
    </>
  );
}