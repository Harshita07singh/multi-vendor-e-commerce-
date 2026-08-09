import { useState } from "react";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api";

const AddAdminModal = ({ close, refreshAdmins }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = await adminAPI.createAdmin(formData);

      toast.success("Admin created successfully!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      refreshAdmins(); // 🔥 refresh table
      close(); // close modal
    } catch (error) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create Admin</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={close}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;
