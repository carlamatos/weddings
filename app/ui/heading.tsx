"use client"

import { useState, ChangeEvent, useEffect } from "react";
import {
    PencilSquareIcon,
  } from '@heroicons/react/24/outline';
export default function EditableHeading() {
    const [isEditing, setIsEditing] = useState<boolean>(false); // Track edit mode
    const [headingText, setHeadingText] = useState<string>("Editable Heading"); // Initial heading text

    const handleEditClick = (): void => setIsEditing(true)
    const handleSaveClick = (): void => setIsEditing(false);

    useEffect(() => {
        if (isEditing) {
          const headingInput = document.getElementById("top_heading") as HTMLInputElement | null;
          if (headingInput) {
            headingInput.focus();
          }
        }
      }, [isEditing]); // Runs whenever `isEditing` changes

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setHeadingText(e.target.value);   
    };

    return (
        <div className="rounded-xl dusty-blue p-2 shadow-sm mb-6">
            <div className="flex p-4 relative justify-end">
             {/* "Edit" or "Save" button */ }
    <button
        onClick={isEditing ? handleSaveClick : handleEditClick}
        className="edit-but"
        
    >
        <PencilSquareIcon />
        {isEditing ? "Save" : "Edit"}

    </button>    
            </div>
                
     

    {/* Editable Heading */ }
    <div className="bg-white">
    {
        isEditing ? (
            <input
                type="text"
                id="top_heading"
                value={headingText}
                onChange={handleInputChange}
                style={{
                    fontSize: "2rem",
                    padding: "5px",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                }}
            />
        ) : (
            <h1 className="top_title" onClick={isEditing ? handleSaveClick : handleEditClick}>{headingText}</h1>
        )
    }
    </div >
    </div>
  );
}
