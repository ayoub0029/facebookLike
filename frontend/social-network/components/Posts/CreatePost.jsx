export function CreatePost() {
    return (
      <div className="newPost">
        <textarea placeholder="Write something here..."></textarea>
        <div className="imgPrivacyPost">
          <label htmlFor="postImage" className="imageUp"><i className="fa-regular fa-image"></i> Image/GIF</label>
          <input type="file" id="postImage" className="imageUpload" accept="image/*,image/gif" />
          <select id="privacy" name="privacy">
            <option value="public">Public</option>
            <option value="almostPrivate">Almost Private (followers only)</option>
            <option value="private">Private (selected followers)</option>
          </select>
        </div>
        <button className="btn btnGreen">Post</button>
      </div>
    );
  }