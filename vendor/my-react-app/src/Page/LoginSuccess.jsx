import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token
      localStorage.setItem("accessToken", token);

      // Fetch user data (optional - if backend returns it in Google response)
      // For now, we'll just show success and redirect

      toast.success("Login successful! 🎉");

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 1500);
    } else {
      toast.error("Login failed. No token received.");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Login...</h2>
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <p className="text-gray-600">
          Please wait while we complete your login.
        </p>
      </div>
    </div>
  );
};

export default LoginSuccess;
