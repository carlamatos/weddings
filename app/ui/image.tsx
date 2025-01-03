"use client"

import { useState } from 'react';
import Image from 'next/image';
export default function ImageUpload() {
  const [image, setImage] = useState<string | null>(null);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Use optional chaining to ensure 'files' is not null
    if (file) {
      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm mb-6">
      <div className="flex p-4 relative justify-end">

        <button className="edit-but" onClick={() => {
          const fileInput = document.getElementById('fileInput');
          if (fileInput) {
            fileInput.click();
          }
        }}>Replace Photo</button>
      </div>
      {/* Image or default placeholder */}

      <div className="banner_wrap">
        <Image
          src={image || '/images/banner_2.png'}
          width={2000}
          height={760}
          className="top_img md:block"
          alt="Screenshots of the dashboard project showing desktop version"
          style={{ cursor: 'pointer' }}

        />


      </div>

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
