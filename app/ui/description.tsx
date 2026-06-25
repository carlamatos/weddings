"use client"

import { useState, useEffect } from "react";
import { PencilSquareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { updateDescription } from '../lib/actions';

export default function EditableDescription({ defaultDescription = '' }: { defaultDescription?: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultDescription);

  useEffect(() => { setText(defaultDescription); }, [defaultDescription]);

  const handleSave = async () => {
    setIsEditing(false);
    await updateDescription(text);
  };

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <p className="dash-card-title">Description</p>
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
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="dash-input dash-textarea"
            autoFocus
          />
        ) : (
          <p className="dash-description-display">{text || 'Add a description for your event.'}</p>
        )}
      </div>
    </div>
  );
}
