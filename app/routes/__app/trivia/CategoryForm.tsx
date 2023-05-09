import { useState, useEffect } from "react";

export const CategoryForm = ({ handleSaveCategory }) => {
  const [newCat, setNewCat] = useState("");
  return (
    <div>
      <div className="card prose w-96">
        <div className="card-body">
          <h2>Add a category</h2>
          <input
            type="text"
            placeholder="Category Name"
            className="input-bordered input-primary input w-full max-w-xs"
            onChange={(e) => setNewCat(e.target.value)}
          />
          <div className="card-actions">
            <button
              className="btn-primary btn"
              onClick={() => handleSaveCategory(newCat)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
