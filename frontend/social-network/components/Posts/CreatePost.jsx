"use client";

import { useState } from "react";
import { fetchApi } from "@/api/fetchApi";

export function CreatePost({onSuccess}) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetchApi("posts", "POST", formData, true);
    
    if (response.status !== undefined) {
      alert(`Error: ${response.error} Status: ${response.status}`);
      return;
    }
    
    // Success
    e.target.reset();
    setImagePreview(null);
    onSuccess()
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
      <form className="newPost" encType="multipart/form-data" onSubmit={handleCreate}>
        <textarea placeholder="Write something here..." name="content"></textarea>

        {imagePreview && (
          <div style={{ maxHeight: "200px", display: "flex", gap: "10px" }}>
            <img src={imagePreview} alt="Preview" style={{ maxHeight: "100%" }} />
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
          <select id="privacy" name="privacy">
            <option value="public">Public</option>
            <option value="almost private">Almost Private (followers only)</option>
            <option value="private">Private (selected followers)</option>
          </select>
        </div>
        <button type="submit" className="btn btnGreen">
          Post
        </button>
      </form>
    </>
  );
}


// "use client";

// import { useState, useEffect } from "react";
// import { fetchApi } from "@/api/fetchApi";
// import Modal from "../model";

// export function CreatePost() {
//   const [imagePreview, setImagePreview] = useState(null);
//   const [followers, setFollowers] = useState([]);
//   const [selectedFollowers, setSelectedFollowers] = useState([]);
//   const [modals, setModals] = useState({
//     selectFollowers: false
//   });

//   // Modal handlers
//   const openModal = (modalName) => {
//     return () => {
//       setModals({ ...modals, [modalName]: true });
//     };
//   };

//   const closeModal = (modalName) => {
//     return () => {
//       setModals({ ...modals, [modalName]: false });
//     };
//   };

//   // Fetch followers when needed
//   useEffect(() => {
//     if (modals.selectFollowers) {
//       fetchFollowers();
//     }
//   }, [modals.selectFollowers]);

//   const fetchFollowers = async () => {
//     try {
//       const response = await fetchApi("/followers");
//       if (response && !response.status) {
//         setFollowers(response);
//       }
//     } catch (err) {
//       console.error("Failed to fetch followers", err);
//     }
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
    
//     if (formData.get('privacy') === 'private' && selectedFollowers.length > 0) {
//       formData.append('selected_followers', JSON.stringify(selectedFollowers));
//     }
    
//     const response = await fetchApi("posts", "POST", formData, true);
//     if (response.status != undefined) {
//       alert(`Error: ${response.error} Status: ${response.status}`);
//       return;
//     }
//     // success
//     e.target.reset();
//     setImagePreview(null);
//     setSelectedFollowers([]);
//     alert(response);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onload = (e) => {       
//         setImagePreview(e.target.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setImagePreview(null);
//     }
//   };

//   const handlePrivacyChange = (e) => {
//     if (e.target.value === "private") {
//       openModal('selectFollowers')();
//     }
//   };

//   const toggleFollower = (followerId) => {
//     setSelectedFollowers(prev => {
//       if (prev.includes(followerId)) {
//         return prev.filter(id => id !== followerId);
//       } else {
//         return [...prev, followerId];
//       }
//     });
//   };

//   return (
//     <>
//       <form className="newPost" encType="multipart/form-data" onSubmit={handleCreate}>
//         <textarea placeholder="Write something here..." name="content"></textarea>

//         {/* Image Preview */}
//         {imagePreview && (
//           <div style={{ maxHeight:"200px", display:"flex", gap:"10px" }}>
//             <img
//               src={imagePreview}
//               alt="Preview"
//               style={{ maxHeight:"100%" }}
//             />
//             <button
//               type="button"
//               style={{cursor:"pointer"}}
//               onClick={() => {
//                 setImagePreview(null);
//                 document.getElementById("postImage").value = "";
//               }}
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         <div className="imgPrivacyPost">
//           <label htmlFor="postImage" className="imageUp">
//             <i className="fa-regular fa-image"></i> Image/GIF
//           </label>
//           <input
//             type="file"
//             id="postImage"
//             className="imageUpload"
//             accept="image/*,image/gif"
//             name="image"
//             onChange={handleImageChange}
//           />
//           <select id="privacy" name="privacy" onChange={handlePrivacyChange}>
//             <option value="public">Public</option>
//             <option value="almost private">Almost Private (followers only)</option>
//             <option value="private">Private (selected followers)</option>
//           </select>
//         </div>
        
//         {/* Display selected followers count if any */}
//         {selectedFollowers.length > 0 && (
//           <div className="selectedFollowersInfo">
//             <span>{selectedFollowers.length} followers selected </span>
//             <button 
//               type="button" 
//               className="editBtn"
//               onClick={openModal('selectFollowers')}
//             >
//               Edit Selection
//             </button>
//           </div>
//         )}
        
//         <button type="submit" className="btn btnGreen">Post</button>
//       </form>

//       {/* Followers Selection Modal */}
//       <Modal
//         isOpen={modals.selectFollowers}
//         onClose={closeModal('selectFollowers')}
//       >
//         <div className="followersSelection">
//           <h3>Select Followers</h3>
          
//           {followers.length === 0 ? (
//             <p>Loading followers...</p>
//           ) : (
//             <div className="followersList">
//               {followers.map((follower) => (
//                 <div key={follower.id} className="followerItem">
//                   <input
//                     type="checkbox"
//                     id={`follower-${follower.id}`}
//                     checked={selectedFollowers.includes(follower.id)}
//                     onChange={() => toggleFollower(follower.id)}
//                   />
//                   <label htmlFor={`follower-${follower.id}`}>
//                     {follower.first_name} {follower.last_name}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
          
//           <div className="modalActions">
//             <button 
//               type="button" 
//               className="btn btnGray"
//               onClick={closeModal('selectFollowers')}
//             >
//               Cancel
//             </button>
//             <button 
//               type="button" 
//               className="btn btnGreen"
//               onClick={() => {
//                 // If no followers are selected, default to "almost private"
//                 if (selectedFollowers.length === 0) {
//                   document.getElementById('privacy').value = 'almost private';
//                 }
//                 closeModal('selectFollowers')();
//               }}
//             >
//               Confirm ({selectedFollowers.length} selected)
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </>
//   );
// }