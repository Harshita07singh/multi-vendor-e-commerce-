import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // ✅ useLocation add kiya
import Swal from "sweetalert2";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  CheckCircle,
  Home,
  ChevronRight,
} from "lucide-react";
import FeaturesGrid from "../../components/FeaturesGrid";
import { Truck, Shield, Headphones, CreditCard } from "lucide-react";
import { useDispatch, useSelector } from "react-redux"; // ✅ useSelector add kiya
import { setUser } from "../../redux/authSlice";
import { mergeGuestDataAfterLogin } from "../../utils/Mergeguestdataafterlogin";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ pata chalega user kahan se aaya
  const dispatch = useDispatch();

  // ✅ Guest cart & wishlist Redux se lo (localStorage mein already hain)
  const guestCartItems = useSelector((state) => state.cart.cartItems);
  const guestWishlistItems = useSelector(
    (state) => state.wishlist.wishlistItems,
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const features = [
    {
      icon: <Truck size={24} className="text-white" />,
      title: "Free Delivery",
      description: "For all orders over $50",
    },
    {
      icon: <Shield size={24} className="text-white" />,
      title: "Secure Payment",
      description: "100% secure transaction",
    },
    {
      icon: <Headphones size={24} className="text-white" />,
      title: "24/7 Support",
      description: "Dedicated customer support",
    },
    {
      icon: <CreditCard size={24} className="text-white" />,
      title: "Easy Returns",
      description: "30-day return policy",
    },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // ✅ Token save karo
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("token", data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      // ✅ User Redux mein save karo
      dispatch(setUser(data.user));

      // ✅ Guest cart & wishlist backend mein merge karo
      // (token ab localStorage mein hai, isliye merge function usse use karega)
      await mergeGuestDataAfterLogin(
        dispatch,
        guestCartItems,
        guestWishlistItems,
      );

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: `Welcome back, ${data.user.name}!`,
        confirmButtonColor: "#299E60",
      }).then(() => {
        // ✅ Agar user cart/wishlist se aaya tha toh wapas wahan bhejo
        const from = location.state?.from;

        if (from) {
          navigate(from);
          return;
        }

        // Warna role ke hisaab se navigate karo
        const role = data.user.role;
        switch (role) {
          case "superadmin":
            navigate("/SuperAdmin");
            break;
          case "admin":
            navigate("/admin");
            break;
          case "vendor":
            navigate("/vendor");
            break;
          case "delivery":
            navigate("/delivery");
            break;
          case "customer":
            navigate("/");
            break;
          default:
            navigate("/");
        }
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <>
      {/* Page Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-3 lg:px-7">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <Link to="/" className="text-gray-600">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-green-700 font-medium">Login</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold text-black mb-1">
                  Welcome Back!
                </h2>
                <p className="text-gray-500 text-sm">Login to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-700" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white ${
                        errors.email
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="example@email.com"
                    />
                    {formData.email && !errors.email && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-700" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                    <Lock className="w-4 h-4 text-green-700" />
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:border-gray-400 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                        errors.password
                          ? "border-red-400 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-700 border-gray-300 rounded focus:ring-green-700"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-green-700 font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#299E60] text-white font-semibold py-3 rounded-2xl transform active:scale-[0.98] transition-all duration-200 shadow-lg mt-4"
                >
                  Login
                </button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-green-700 font-semibold transition-all"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-16 lg:mt-10">
        <FeaturesGrid features={features} />
      </div>
    </>
  );
};

export default Login;
