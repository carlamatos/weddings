"use client"

import { useState, useEffect } from "react";
import { PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { updateHeading } from '../lib/actions';

export default function EditableHeading({ defaultHeading = 'Your Event' }: { defaultHeading?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultHeading);

  useEffect(() => { setText(defaultHeading); }, [defaultHeading]);

  const handleSave = async () => {
    setIsEditing(false);
    await updateHeading(text);
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Event Name</p>
        <button
          className={`dash-edit-btn${isEditing ? ' dash-edit-btn--save' : ''}`}
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
        >
          {isEditing ? <CheckIcon /> : <PencilSquareIcon />}
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      <div className="dash-card-body">
        {isEditing ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="dash-heading-input"
            autoFocus
          />
        ) : (
          <h1 className="dash-heading-display">{text || 'Your Event'}</h1>
        )}
      </div>
    </div>
  );
}
