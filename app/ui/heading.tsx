"use client"

import { useState, useEffect } from "react";
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { updateHeading } from '../lib/actions';

interface Props {
  defaultHeading?: string;
}

export default function EditableHeading({ defaultHeading = 'Your Event' }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultHeading);

  useEffect(() => { setText(defaultHeading); }, [defaultHeading]);

  const handleSave = async () => {
    setIsEditing(false);
    await updateHeading(text);
  };

  return (
    <div className="wedding-heading-section">
      <div className="section-toolbar">
        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="edit-but">
          <PencilSquareIcon />
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="wedding-heading-input"
          autoFocus
        />
      ) : (
        <h1 className="wedding-heading">{text}</h1>
      )}
    </div>
  );
}
