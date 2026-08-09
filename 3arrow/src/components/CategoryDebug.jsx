// 3arrow/src/components/CategoryDebug.jsx
// Temporary debug component to verify category loading

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCategories } from "../redux/categorySlice";

export default function CategoryDebug() {
  const dispatch = useDispatch();
  const { categories, status, error } = useSelector(
    (state) => state.categories,
  );

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  return (
    <div
      style={{
        padding: "20px",
        margin: "20px",
        border: "2px solid #299E60",
        borderRadius: "8px",
        backgroundColor: "#f5f9f6",
        fontFamily: "monospace",
      }}
    >
      <h3 style={{ color: "#299E60", margin: "0 0 15px 0" }}>
        🔍 Category Debug Info
      </h3>

      <div style={{ marginBottom: "10px" }}>
        <strong>Status:</strong>{" "}
        <span
          style={{
            color:
              status === "succeeded"
                ? "green"
                : status === "loading"
                  ? "blue"
                  : "red",
          }}
        >
          {status}
        </span>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Total Categories:</strong> {categories.length}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <strong>Categories List:</strong>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#e0f2e9" }}>
                <th style={{ border: "1px solid #299E60", padding: "8px" }}>
                  Name
                </th>
                <th style={{ border: "1px solid #299E60", padding: "8px" }}>
                  Slug
                </th>
                <th style={{ border: "1px solid #299E60", padding: "8px" }}>
                  Image
                </th>
                <th style={{ border: "1px solid #299E60", padding: "8px" }}>
                  Active
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td style={{ border: "1px solid #299E60", padding: "8px" }}>
                    {cat.name}
                  </td>
                  <td style={{ border: "1px solid #299E60", padding: "8px" }}>
                    {cat.slug}
                  </td>
                  <td
                    style={{
                      border: "1px solid #299E60",
                      padding: "8px",
                      fontSize: "11px",
                    }}
                  >
                    {cat.image ? "✓" : "✗"}
                  </td>
                  <td style={{ border: "1px solid #299E60", padding: "8px" }}>
                    {cat.isActive ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === "loading" && <p>⏳ Loading categories...</p>}

      {status === "succeeded" && categories.length === 0 && (
        <p style={{ color: "orange" }}>
          ⚠️ No categories found. Check server and database.
        </p>
      )}
    </div>
  );
}

/* 
HOW TO USE (for debugging):
1. Import this in Home.jsx:
   import CategoryDebug from "./components/CategoryDebug";

2. Add it to the JSX before CategorySlider:
   <CategoryDebug />
   <CategorySlider />

3. This will show:
   - Redux state status (loading/succeeded/failed)
   - Total count of loaded categories
   - Table of all categories

4. Remove this component after debugging is complete
*/
