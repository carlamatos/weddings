"use client"

import { useState, ChangeEvent, useEffect } from "react";

// Define the prop type for the default description (making it optional)
interface EditableDescriptionProps {
  defaultDescription?: string;
}

export default function EditableDescription({ defaultDescription = "Editable Description" }: EditableDescriptionProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false); // Track edit mode
  const [descriptionText, setDescriptionText] = useState<string>(defaultDescription); // Use defaultDescription as the initial value

  const handleEditClick = (): void => setIsEditing(true);

  const handleSaveClick = (): void => setIsEditing(false);

  useEffect(() => {
    if (isEditing) {
      const headingInput = document.getElementById("description") as HTMLInputElement | null;
      if (headingInput) {
        headingInput.focus();
      }
    }
  }, [isEditing]); // Runs whenever `isEditing` changes
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setDescriptionText(e.target.value);
  };

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm mb-6">
            <div className="flex p-4 relative justify-end">
      {/* "Edit" or "Save" button */}
      <button
        onClick={isEditing ? handleSaveClick : handleEditClick}
        className="edit-but"
      >
        {isEditing ? "Save" : "Edit"}
      </button>
        </div>
      {/* Editable Description */}
      <div className="bg-white">
      {isEditing ? (
        <textarea
          value={descriptionText}
          id="description"
          onChange={handleInputChange}
          rows={5} // Adjust the number of rows for the textarea
          style={{
            fontSize: "1rem",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "100%",
            resize: "vertical", // Allow vertical resizing
          }}
        />
      ) : (
        <p className="description_text" onClick={isEditing ? handleSaveClick : handleEditClick}>{descriptionText}</p>
      )}
      </div>
    </div>
  );
}
