import React from "react";
import { useState, useEffect } from "react";
import { adminAPI } from "../../services/api";

const ViewAdminsModal = ({ close, setEditAdmin, deleteAdmin }) => {
  const [adminsList, setAdminsList] = useState([]);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const data = await adminAPI.getAdmins(page, search);

      setAdminsList(data.admins);
      setPages(data.pages);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setAdminsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] max-w-4xl rounded-xl shadow-lg p-6 relative">
        <input
          type="text"
          placeholder="Search Admin..."
          value={search}
          onChange={handleSearchChange}
          className="border px-4 py-2 rounded-lg mb-4 w-50%"
        />

        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-3 right-4 text-gray-500 text-xl hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">All Admins</h2>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : adminsList.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">No admins found</div>
            </div>
          ) : (
            <table className="w-full border">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {adminsList.map((admin) => (
                  <tr key={admin._id} className="border-t">
                    <td className="p-3">{admin.name}</td>
                    <td className="p-3">{admin.email}</td>
                    <td className="p-3">{admin.phone}</td>
                    <td className="p-3 space-x-2">
                      <button
                        onClick={() => setEditAdmin(admin)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteAdmin(admin._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {adminsList.length > 0 && (
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="text-sm text-gray-600">
              Page {page} of {pages || 1}
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                const start = Math.max(1, page - 2);
                return start + i;
              }).map(
                (pageNum) =>
                  pageNum <= pages && (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-2 py-1 border rounded text-sm ${
                        page === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
              )}
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAdminsModal;
