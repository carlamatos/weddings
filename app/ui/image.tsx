"use client"

import { useState } from 'react';
import Image from 'next/image';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function ImageUpload({ defaultImage }: { defaultImage?: string }) {
  const [image, setImage] = useState<string | null>(defaultImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Banner Photo</p>
        <label className="dash-edit-btn" style={{ cursor: 'pointer' }}>
          <PhotoIcon style={{ width: 14, height: 14 }} />
          Replace Photo
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </label>
      </div>
      <div className="dash-card-body">
        <Image
          src={image || '/images/themes/wedding/banner.png'}
          width={1200}
          height={400}
          className="dash-banner-preview"
          alt="Event banner"
        />
      </div>
    </div>
  );
}
