"use client"

import { useState } from 'react';

export default function ImageUpload() {
  const [image, setImage] = useState(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div>
      {/* Image or default placeholder */}
      <img
        src={image || '/banner_2.jpeg'} // Default image if no image is uploaded
        alt="Uploaded"
        style={{ width: '200px', height: '200px', cursor: 'pointer' }}
        onClick={() => document.getElementById('fileInput').click()} // Trigger file input on image click
      />
      
      {/* Hidden file input */}
      <input
        type="file"
        id="fileInput"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
}
