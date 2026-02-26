"use client"

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  defaultImage?: string;
}

export default function ImageUpload({ defaultImage }: Props) {
  const [image, setImage] = useState<string | null>(defaultImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="wedding-banner-section">
      <div className="section-toolbar">
        <button className="edit-but" onClick={() => document.getElementById('bannerFileInput')?.click()}>
          Replace Photo
        </button>
      </div>
      <div className="banner_wrap">
        <Image
          src={image || '/images/themes/wedding/banner.png'}
          width={2000}
          height={760}
          className="top_img"
          alt="Event banner"
          style={{ cursor: 'pointer' }}
        />
      </div>
      <input
        type="file"
        id="bannerFileInput"
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
}
