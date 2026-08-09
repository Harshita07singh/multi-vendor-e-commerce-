import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyVendor } from "../services/vendorService";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store token
      localStorage.setItem("accessToken", token);

      // Check if vendor profile exists
      const checkVendorProfile = async () => {
        try {
          const vendor = await getMyVendor();
          console.log("Vendor profile check result:", vendor);

          if (vendor) {
            // Vendor profile exists, go to dashboard
            toast.success("Login successful! 🎉");
            setTimeout(() => {
              navigate("/dashboard");
            }, 1500);
          } else {
            // No vendor profile, redirect to onboarding
            toast.success("Login successful! 🎉");
            setTimeout(() => {
              navigate("/vendor/onboarding");
            }, 1500);
          }
        } catch (error) {
          console.error("Error checking vendor profile:", error);
          toast.error("Login failed. Please try again.");
          setTimeout(() => navigate("/"), 2000);
        }
      };

      checkVendorProfile();
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
