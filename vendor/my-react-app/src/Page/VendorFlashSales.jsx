import React, { useEffect, useState } from "react";
import { flashSaleAPI, vendorProductAPI } from "../services/vendorService";
import toast from "react-hot-toast";
import {
  Zap,
  Users,
  Calendar,
  ShoppingBag,
  Plus,
  CheckCircle,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (
    imagePath.startsWith("blob:") ||
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }
  if (imagePath.startsWith("/")) return `${BACKEND_URL}${imagePath}`;
  return `${BACKEND_URL}/${imagePath}`;
};

const SaleBadge = ({ status }) => {
  const map = {
    notified: { cls: "bg-blue-100 text-blue-600", label: "📢 Open to Join" },
    live: { cls: "bg-green-100 text-green-600", label: "🔴 Live Now" },
  };
  const s = map[status] || { cls: "bg-gray-100 text-gray-500", label: status };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

/* ─── Helper: get product category ID as string ─── */
const getProductCategoryId = (product) => {
  if (!product?.category) return null;
  return typeof product.category === "object"
    ? product.category._id?.toString()
    : product.category?.toString();
};

const AddProductModal = ({ sale, onClose, onAdded, onGoToProducts }) => {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [salePrice, setSalePrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("existing");

  // ─── Category restriction: IDs of allowed categories ───────────────────
  const restrictedCategoryIds = (sale.targetCategories || []).map((c) =>
    typeof c === "object" ? c._id?.toString() : c?.toString(),
  );
  const isCategoryRestricted = restrictedCategoryIds.length > 0;
  const restrictedCategoryNames = (sale.targetCategories || [])
    .map((c) => (typeof c === "object" ? c.name : c))
    .filter(Boolean);
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    vendorProductAPI
      .getMyProducts()
      .then((data) => setMyProducts(data?.products || []))
      .catch(() => toast.error("Failed to load your products"))
      .finally(() => setLoading(false));
  }, []);

  const discountPercent =
    selectedProduct && salePrice
      ? Math.round(
          ((selectedProduct.price - Number(salePrice)) /
            selectedProduct.price) *
            100,
        )
      : 0;

  const handleAdd = async () => {
    if (!selectedProduct) return toast.error("Select a product");
    if (!salePrice || Number(salePrice) <= 0)
      return toast.error("Enter a valid sale price");
    if (Number(salePrice) >= selectedProduct.price)
      return toast.error("Sale price must be less than original price");
    if (discountPercent < sale.minDiscountRequired)
      return toast.error(
        `Minimum ${sale.minDiscountRequired}% discount required`,
      );
    try {
      setSaving(true);
      await flashSaleAPI.addProduct(sale._id, {
        productId: selectedProduct._id,
        salePrice: Number(salePrice),
      });
      toast.success("Product added to sale!");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const alreadyInSaleIds = new Set(
    (sale.products || []).map((p) =>
      typeof p.product === "object" ? p.product?._id : p.product,
    ),
  );

  // ─── Filter: remove already-added AND enforce category restriction ──────
  const availableProducts = myProducts.filter((p) => {
    if (alreadyInSaleIds.has(p._id)) return false;
    if (isCategoryRestricted) {
      const catId = getProductCategoryId(p);
      return catId && restrictedCategoryIds.includes(catId);
    }
    return true;
  });

  const blockedByCategory = isCategoryRestricted
    ? myProducts.filter((p) => {
        if (alreadyInSaleIds.has(p._id)) return false;
        const catId = getProductCategoryId(p);
        return !catId || !restrictedCategoryIds.includes(catId);
      })
    : [];
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            Add Product to Sale
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-4">
          {/* Sale info banner */}
          <div
            className="rounded-xl p-4 mb-4 text-white"
            style={{ backgroundColor: "green" }}
          >
            <div className="font-bold text-lg">{sale.title}</div>
            <div className="text-white/80 text-sm mt-1">
              Min. {sale.minDiscountRequired}% discount required
            </div>
          </div>

          {/* ─── Category Restriction Notice ──────────────────────────────── */}
          {isCategoryRestricted && (
            <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4">
              <Tag className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-purple-700">
                  Category Restricted Sale
                </p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Only products from:{" "}
                  <span className="font-medium">
                    {restrictedCategoryNames.join(", ")}
                  </span>{" "}
                  can be added.
                </p>
                {blockedByCategory.length > 0 && (
                  <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {blockedByCategory.length} of your products are not eligible
                    for this sale.
                  </p>
                )}
              </div>
            </div>
          )}
          {/* ──────────────────────────────────────────────────────────────── */}

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("existing")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === "existing" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <ShoppingBag className="w-4 h-4 inline mr-1" /> Existing Products
            </button>
            <button
              onClick={() => {
                setActiveTab("new");
                toast("Create a product in Products section first!", {
                  icon: "💡",
                });
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === "new" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Plus className="w-4 h-4 inline mr-1" /> Add New Product
            </button>
          </div>

          {activeTab === "new" ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center mb-4">
              <div className="text-3xl mb-2">💡</div>
              <p className="text-sm text-yellow-800 font-medium">
                Create your product in the Products section first, then come
                back!
              </p>
              {isCategoryRestricted && (
                <p className="text-xs text-yellow-700 mt-1">
                  Make sure your product belongs to:{" "}
                  <strong>{restrictedCategoryNames.join(", ")}</strong>
                </p>
              )}
              <button
                onClick={() => {
                  onClose();
                  if (onGoToProducts) onGoToProducts();
                }}
                className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                Go to Products
              </button>
            </div>
          ) : loading ? (
            <p className="text-center text-gray-400 py-6 animate-pulse">
              Loading your products…
            </p>
          ) : availableProducts.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No eligible products available</p>
              {isCategoryRestricted && (
                <p className="text-xs mt-1 text-purple-500">
                  Add products in: {restrictedCategoryNames.join(", ")}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {availableProducts.map((p) => {
                const imgUrl = getImageUrl(p.images?.[0]?.url);
                const catName =
                  typeof p.category === "object"
                    ? p.category?.name
                    : p.category;
                return (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      setSalePrice("");
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border-2 transition ${selectedProduct?._id === p._id ? "border-red-400 bg-red-50" : "border-gray-100 hover:border-gray-200 bg-gray-50"}`}
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={p.name}
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/48x48?text=P";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-500">₹{p.price}</p>
                      {catName && (
                        <p className="text-xs text-purple-500 flex items-center gap-1 mt-0.5">
                          <Tag className="w-3 h-3" /> {catName}
                        </p>
                      )}
                    </div>
                    {selectedProduct?._id === p._id && (
                      <CheckCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Price input */}
          {selectedProduct && (
            <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Selected:</span>
                <span className="font-medium text-gray-800 truncate max-w-[60%]">
                  {selectedProduct.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Original Price:</span>
                <span className="font-semibold text-gray-700">
                  ₹{selectedProduct.price}
                </span>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Your Sale Price (₹)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder={`Max ₹${selectedProduct.price - 1}`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                />
              </div>
              {salePrice && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span
                    className={`font-bold ${discountPercent >= sale.minDiscountRequired ? "text-green-600" : "text-red-500"}`}
                  >
                    {discountPercent}%
                    {discountPercent < sale.minDiscountRequired && (
                      <span className="font-normal text-red-400 ml-1">
                        (need {sale.minDiscountRequired}%+)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          {selectedProduct && (
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add to Sale"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const VendorFlashSales = ({ onGoToProducts }) => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(null);
  const [joining, setJoining] = useState(null);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const data = await flashSaleAPI.getOpenSales();
      setSales(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleJoin = async (saleId) => {
    try {
      setJoining(saleId);
      await flashSaleAPI.joinSale(saleId);
      toast.success("You joined the sale! Now add your products 🎉");
      fetchSales();
    } catch (err) {
      toast.error(err.message || "Failed to join");
    } finally {
      setJoining(null);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading)
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray-400 animate-pulse">Loading flash sales…</p>
      </div>
    );

  if (sales.length === 0)
    return (
      <div className="text-center py-16 text-gray-400">
        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="font-medium text-lg">No active flash sales right now</p>
        <p className="text-sm mt-1">
          Check back later — admin will notify you when a sale opens!
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-300 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Flash Sales</h2>
        </div>
        <p className="text-white/80">
          Join active flash sales and add your products to reach more customers!
        </p>
      </div>

      {sales.map((sale) => {
        const bannerUrl = getImageUrl(sale.bannerImage);
        const categoryNames = (sale.targetCategories || [])
          .map((c) => (typeof c === "object" ? c.name : c))
          .filter(Boolean);

        return (
          <div
            key={sale._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          >
            {bannerUrl ? (
              <div className="relative h-32 overflow-hidden">
                <img
                  src={bannerUrl}
                  alt={sale.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.style.backgroundColor =
                      sale.bannerColor || "#e63946";
                    e.target.parentElement.style.height = "80px";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-white font-bold text-xl">
                      {sale.title}
                    </h3>
                    {sale.displayBannerText && (
                      <p className="text-white/80 text-sm">
                        {sale.displayBannerText}
                      </p>
                    )}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <SaleBadge status={sale.status} />
                </div>
              </div>
            ) : (
              <div
                className="h-20 flex items-center justify-between px-6"
                style={{ backgroundColor: sale.bannerColor || "#e63946" }}
              >
                <div>
                  <h3 className="text-white font-bold text-lg">{sale.title}</h3>
                  {sale.displayBannerText && (
                    <p className="text-white/70 text-sm">
                      {sale.displayBannerText}
                    </p>
                  )}
                </div>
                <SaleBadge status={sale.status} />
              </div>
            )}

            <div className="p-5">
              {sale.description && (
                <p className="text-sm text-gray-600 mb-4">{sale.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDate(sale.startDate)} → {formatDate(sale.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" />
                  {sale.participants?.filter((p) => p.status === "joined")
                    .length || 0}{" "}
                  vendors joined
                </span>
                <span className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold">
                  <Tag className="w-3.5 h-3.5" />
                  Min {sale.minDiscountRequired}% discount required
                </span>
              </div>

              {/* ─── Category Restriction Pill Row ──────────────────────── */}
              {categoryNames.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs text-purple-500 font-semibold flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" /> Only for:
                  </span>
                  {categoryNames.map((name) => (
                    <span
                      key={name}
                      className="text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
              {/* ──────────────────────────────────────────────────────────── */}

              {sale.notifiedAt && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 text-xs mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  Admin notified you on{" "}
                  {new Date(sale.notifiedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!sale.hasJoined ? (
                  <button
                    onClick={() => handleJoin(sale._id)}
                    disabled={joining === sale._id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 shadow-sm shadow-red-200"
                  >
                    <Zap className="w-4 h-4" />
                    {joining === sale._id ? "Joining…" : "Join Now"}
                  </button>
                ) : (
                  <div className="flex flex-wrap gap-3 w-full">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      Joined ✓
                    </div>
                    <button
                      onClick={() => setAddModal(sale)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Products to This Sale
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {addModal && (
        <AddProductModal
          sale={addModal}
          onClose={() => setAddModal(null)}
          onAdded={fetchSales}
          onGoToProducts={onGoToProducts}
        />
      )}
    </div>
  );
};

export default VendorFlashSales;
