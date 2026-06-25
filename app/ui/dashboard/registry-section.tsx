"use client"

import { useState, useEffect } from 'react';
import { PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { updateSection2 } from '@/app/lib/actions';

interface Props {
  defaultImage?: string;
  defaultDescription?: string;
  defaultButtonText?: string;
  defaultButtonLink?: string;
}

export default function RegistrySection({
  defaultImage = '',
  defaultDescription = 'We have a few items on our registry that would make our new home feel extra special.',
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
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Registry Section</p>
        <button
          className={`dash-edit-btn${isEditing ? ' dash-edit-btn--save' : ''}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? <CheckIcon style={{ width: 14, height: 14 }} /> : <PencilSquareIcon style={{ width: 14, height: 14 }} />}
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <div className="dash-card-body">
        {isEditing && (
          <div className="dash-edit-fields">
            <div className="dash-field">
              <label>Section Text</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="dash-input dash-textarea"
              />
            </div>
            <div className="dash-2col">
              <div className="dash-field">
                <label>Button Text</label>
                <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="dash-input" />
              </div>
              <div className="dash-field">
                <label>Button URL</label>
                <input type="url" value={buttonLink} onChange={(e) => setButtonLink(e.target.value)} className="dash-input" placeholder="https://…" />
              </div>
            </div>
            <div className="dash-field">
              <label>Replace Image</label>
              <label className="dash-file-label">
                Choose file
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        )}

        <div className="dash-registry-preview" style={{ backgroundImage: `url(${displayImage})` }}>
          <div className="dash-registry-preview-overlay">
            <span className="dash-registry-preview-label">Registry</span>
          </div>
        </div>
        <p className="dash-description-display" style={{ marginTop: 12 }}>{description}</p>
        {buttonLink && (
          <a href={buttonLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--rose)', fontWeight: 600, textDecoration: 'none' }}>
            {buttonText} →
          </a>
        )}
      </div>
    </div>
  );
}
