// import { Routes, Route, Outlet } from "react-router-dom";
// import Navbar from "./components/navbar/Navbar";
// import Footer from "./components/footer/Footer";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./Pages/Account/Login";
// import Register from "./Pages/Account/Register";
// import Contact from "./Pages/Account/Contact";
// import ForgotPassword from "./Pages/Account/Forgotpassword";
// import VerifyOtp from "./Pages/Account/Verifyotp";
// import ResetPassword from "./Pages/Account/Resetpassword";

// import Home from "./Pages/home/Home";
// import SuperAdmin from "./Pages/SuperAdminDashbard/SuperAdmin";
// import Admin from "./Pages/Admin/Admin";
// import Vendor from "./Pages/Vendor/vendor";
// import Delivery from "./Pages/Delivery/Delivery";
// import Shop from "./Pages/shop/Shop";
// import ShopDetails from "./Pages/shop/ShopDetails";
// import BuyNow from "./Pages/Buynow";

// import Cart from "./Pages/cartpage/Cart";
// import Wishlist from "./Pages/wishlist/Wishlist";
// import CategoryPage from "./Pages/CategoryPage";
// import ProductDetailPage from "./Pages/Productdetailpage";
// import SubCategoryPage from "./Pages/SubCategoryPage";
// import Profile from "./Pages/Profile";
// import { useEffect } from "react";
// import { wishlistAPI } from "./services/api";
// import { setWishlistFromBackend } from "./redux/wishlistSlice";
// import { useSelector, useDispatch } from "react-redux";
// import Orders from "./Pages/Orders";
// import SaleProductsPage from "./Pages/Saleproductspage";
// import useAuthLogout from "./hooks/useAuthLogout";
// import ScrollToTop from "./components/ScrollToTop";
// import RefundPolicy from "./components/Refundpolicy";
// import Privacypolicy from "./components/Privacypolicy";
// import TermsAndConditions from "./components/Termsandconditions";
// import CancellationPolicy from "./components/Cancellationpolicy";
// import ShippingPolicy from "./components/Shippingpolicy";
// import VendorDetailPage from "./Pages/SuperAdminDashbard/All Management/Vendordetailpage";
// function MainLayout() {
//   return (
//     <>
//       <Navbar />
//       <Outlet />
//       <Footer />
//     </>
//   );
// }

// // ✅ Separate inner component so hooks run INSIDE Provider
// function AppInner() {
//   useAuthLogout();
//   const dispatch = useDispatch();
//   const { isLoggedIn } = useSelector((state) => state.auth);

//   useEffect(() => {
//     if (isLoggedIn) {
//       wishlistAPI.getWishlist().then((res) => {
//         if (res.success) {
//           dispatch(setWishlistFromBackend(res.data));
//         }
//       });
//     }
//   }, [isLoggedIn]);

//   return (
//     <>
//       <ScrollToTop />{" "}
//       {/* ✅ Outside <Routes> so it works on every navigation */}
//       <Routes>
//         <Route element={<MainLayout />}>
//           {/* ✅ Public routes — anyone can access */}
//           <Route path="/" element={<Home />} />
//           <Route path="/shop" element={<Shop />} />
//           <Route path="/shop/:id" element={<ShopDetails />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/Register" element={<Register />} />
//           <Route path="/Contact" element={<Contact />} />
//           <Route path="/product/:slug" element={<ProductDetailPage />} />
//           <Route
//             path="/category/:categoryId/:categoryName"
//             element={<CategoryPage />}
//           />
//           <Route
//             path="/subcategory/:subCategoryId/:subCategoryName"
//             element={<SubCategoryPage />}
//           />
//           <Route path="/cart" element={<Cart />} />
//           <Route path="/wishlist" element={<Wishlist />} />
//           <Route path="/daily-sale/:saleId" element={<SaleProductsPage />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
//           <Route path="/verify-otp" element={<VerifyOtp />} />
//           <Route path="/reset-password" element={<ResetPassword />} />
//           <Route path="/reset-password/:token" element={<ResetPassword />} />
//           <Route path="/refund-policy" element={<RefundPolicy />} />
//           <Route path="/privacy-policy" element={<Privacypolicy />} />
//           <Route
//             path="/terms-and-conditions"
//             element={<TermsAndConditions />}
//           />
//           <Route path="/cancellation-policy" element={<CancellationPolicy />} />
//           <Route path="/shipping-policy" element={<ShippingPolicy />} />
//           {/* 🔒 Logged-in users only */}
//           <Route element={<ProtectedRoute />}>
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/buy-now" element={<BuyNow />} />
//             <Route path="/orders" element={<Orders />} />
//           </Route>

//           {/* 🔒 Admin only */}
//           <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
//             <Route path="/Admin" element={<Admin />} />
//           </Route>
//           {/* 🔒 Vendor only */}
//           <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
//             <Route path="/Vendor" element={<Vendor />} />
//           </Route>
//           {/* 🔒 Delivery only */}
//           <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
//             <Route path="/Delivery" element={<Delivery />} />
//           </Route>
//         </Route>

//         {/* 🔒 Super Admin — outside MainLayout */}
//         <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
//           <Route path="/SuperAdmin" element={<SuperAdmin />} />
//           <Route
//             path="/admin/vendors/:vendorId"
//             element={<VendorDetailPage />}
//           />
//         </Route>
//       </Routes>
//     </>
//   );
// }

// // ✅ Provider wraps everything — AppInner runs inside it
// function App() {
//   return <AppInner />;
// }

// export default App;
import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import { wishlistAPI } from "./services/api";
import { setWishlistFromBackend } from "./redux/wishlistSlice";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import useAuthLogout from "./hooks/useAuthLogout";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// Auth
const Login = lazy(() => import("./Pages/Account/Login"));
const Register = lazy(() => import("./Pages/Account/Register"));
const Contact = lazy(() => import("./Pages/Account/Contact"));
const ForgotPassword = lazy(() => import("./Pages/Account/Forgotpassword"));
const VerifyOtp = lazy(() => import("./Pages/Account/Verifyotp"));
const ResetPassword = lazy(() => import("./Pages/Account/Resetpassword"));

// Public pages
const Home = lazy(() => import("./Pages/home/Home"));
const Shop = lazy(() => import("./Pages/shop/Shop"));
const ShopDetails = lazy(() => import("./Pages/shop/ShopDetails"));
const BuyNow = lazy(() => import("./Pages/Buynow"));
const Cart = lazy(() => import("./Pages/cartpage/Cart"));
const Wishlist = lazy(() => import("./Pages/wishlist/Wishlist"));
const CategoryPage = lazy(() => import("./Pages/CategoryPage"));
const SubCategoryPage = lazy(() => import("./Pages/SubCategoryPage"));
const ProductDetailPage = lazy(() => import("./Pages/Productdetailpage"));
const SaleProductsPage = lazy(() => import("./Pages/Saleproductspage"));
const Profile = lazy(() => import("./Pages/Profile"));
const Orders = lazy(() => import("./Pages/Orders"));
const SearchResultsPage = lazy(() => import("./Pages/Searchresultspage"));

// Policy pages
const RefundPolicy = lazy(() => import("./components/Refundpolicy"));
const Privacypolicy = lazy(() => import("./components/Privacypolicy"));
const TermsAndConditions = lazy(
  () => import("./components/Termsandconditions"),
);
const CancellationPolicy = lazy(
  () => import("./components/Cancellationpolicy"),
);
const ShippingPolicy = lazy(() => import("./components/Shippingpolicy"));

// Role-gated dashboards (heaviest — most benefit from lazy loading)
const Admin = lazy(() => import("./Pages/Admin/Admin"));
const Vendor = lazy(() => import("./Pages/Vendor/vendor"));
const Delivery = lazy(() => import("./Pages/Delivery/Delivery"));
const SuperAdmin = lazy(() => import("./Pages/SuperAdminDashbard/SuperAdmin"));
const VendorDetailPage = lazy(
  () => import("./Pages/SuperAdminDashbard/All Management/Vendordetailpage"),
);

// ─── Fallback loader ──────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      {/* Swap with your project's spinner/skeleton if you have one */}
      <span>Loading…</span>
    </div>
  );
}

// ─── Layouts ──────────────────────────────────────────────────────────────────
function MainLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

// ─── App inner (hooks live here, inside the Redux Provider) ───────────────────
function AppInner() {
  useAuthLogout();
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn) {
      wishlistAPI.getWishlist().then((res) => {
        if (res.success) dispatch(setWishlistFromBackend(res.data));
      });
    }
  }, [isLoggedIn]);

  return (
    <>
      <ScrollToTop />

      {/* Single Suspense boundary wraps ALL routes */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            {/* ── Public ── */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ShopDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Contact" element={<Contact />} />

            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route
              path="/category/:categoryId/:categoryName"
              element={<CategoryPage />}
            />
            <Route
              path="/subcategory/:subCategoryId/:subCategoryName"
              element={<SubCategoryPage />}
            />

            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/daily-sale/:saleId" element={<SaleProductsPage />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* ── Policy pages ── */}
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/privacy-policy" element={<Privacypolicy />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditions />}
            />
            <Route
              path="/cancellation-policy"
              element={<CancellationPolicy />}
            />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/search" element={<SearchResultsPage />} />

            {/* ── Logged-in users only ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/buy-now" element={<BuyNow />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* ── Role-gated dashboards ── */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/Admin" element={<Admin />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["vendor"]} />}>
              <Route path="/Vendor" element={<Vendor />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["delivery"]} />}>
              <Route path="/Delivery" element={<Delivery />} />
            </Route>
          </Route>

          {/* ── Super Admin — outside MainLayout ── */}
          <Route element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
            <Route path="/SuperAdmin" element={<SuperAdmin />} />
            <Route
              path="/admin/vendors/:vendorId"
              element={<VendorDetailPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return <AppInner />;
}

export default App;
