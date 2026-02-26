"use client"

import { useState, useEffect } from 'react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateSection2 } from '@/app/lib/actions';

interface Props {
  defaultImage?: string;
  defaultDescription?: string;
  defaultButtonText?: string;
  defaultButtonLink?: string;
}

export default function RegistrySection({
  defaultImage = '',
  defaultDescription = 'We have a few items on our registry that would make our new home feel extra special. Your presence at our wedding is the greatest gift of all.',
  defaultButtonText = 'View Registry',
  defaultButtonLink = '',
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(defaultDescription);
  const [buttonText, setButtonText] = useState(defaultButtonText);
  const [buttonLink, setButtonLink] = useState(defaultButtonLink);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => { setDescription(defaultDescription); }, [defaultDescription]);
  useEffect(() => { setButtonText(defaultButtonText); }, [defaultButtonText]);
  useEffect(() => { setButtonLink(defaultButtonLink); }, [defaultButtonLink]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setIsEditing(false);
    await updateSection2({ image: defaultImage, description, buttonText, buttonLink });
  };

  const displayImage = previewImage || defaultImage || '/images/themes/wedding/registry.png';

  return (
    <div className="wedding-registry-section">
      <div className="section-toolbar">
        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="edit-but">
          <PencilSquareIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      {isEditing && (
        <div className="registry-edit-fields">
          <label className="registry-edit-label">Section Text</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="setup-input"
          />
          <label className="registry-edit-label">Button Text</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            className="setup-input"
          />
          <label className="registry-edit-label">Button URL</label>
          <input
            type="url"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            className="setup-input"
            placeholder="https://..."
          />
          <label className="registry-edit-label">Replace Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className="registry-file-input" />
        </div>
      )}

      <div className="registry-image-wrap" style={{ backgroundImage: `url(${displayImage})` }}>
        <div className="registry-overlay">
          <h2 className="registry-title">REGISTRY</h2>
          <p className="registry-description">{description}</p>
          <a
            href={buttonLink || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="registry-button"
          >
            {buttonText}
          </a>
        </div>
      </div>
    </div>
  );
}
