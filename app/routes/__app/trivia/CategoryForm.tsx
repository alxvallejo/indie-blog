import { useState, useEffect } from "react";

export const CategoryForm = ({ handleSaveCategory }) => {
  const [newCat, setNewCat] = useState("");
  return (
    <div>
      <div className="card prose w-96">
        <div className="card-body">
          <div className="form-control">
            <div className="input-group">
              <input
                type="text"
                placeholder="Add a category"
                className="input-bordered input w-full max-w-xs"
                onChange={(e) => setNewCat(e.target.value)}
              />
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
    </div>
  );
};
