"use client"

import { useState, useEffect } from "react";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateDescription } from '../lib/actions';

interface Props {
  defaultDescription?: string;
}

export default function EditableDescription({ defaultDescription = '' }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultDescription);

  useEffect(() => { setText(defaultDescription); }, [defaultDescription]);

  const handleSave = async () => {
    setIsEditing(false);
    await updateDescription(text);
  };

  return (
    <div className="wedding-description-section">
      <div className="section-toolbar">
        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="edit-but">
          <PencilSquareIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="wedding-description-input"
          autoFocus
        />
      ) : (
        <p className="wedding-description">{text}</p>
      )}
    </div>
  );
}
