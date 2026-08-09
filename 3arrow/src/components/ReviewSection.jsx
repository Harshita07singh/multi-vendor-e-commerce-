// ReviewSection.jsx  — drop this file into src/components/
// Then import and use inside ProductDetailPage.jsx (see bottom of this file)

import { useState, useEffect, useCallback } from "react";
import {
  Star,
  ThumbsUp,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  ChevronDown,
  Loader,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL_UB || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────
// Utility: star row
// ─────────────────────────────────────────────────────────────
function StarRow({ value, onChange, size = 24, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((s) => {
        const active = (hovered || value) >= s;
        return (
          <Star
            key={s}
            size={size}
            fill={active ? "#f5a623" : "none"}
            color={active ? "#f5a623" : "#d8eddf"}
            style={{
              cursor: readonly ? "default" : "pointer",
              transition: "transform .15s",
            }}
            onMouseEnter={() => !readonly && setHovered(s)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(s)}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Rating breakdown bar
// ─────────────────────────────────────────────────────────────
function BreakdownBar({ star, count, total, active, onClick }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "3px 0",
        width: "100%",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          color: active ? "#299E60" : "#6b8577",
          width: 12,
          textAlign: "right",
        }}
      >
        {star}
      </span>
      <Star
        size={12}
        fill={active ? "#299E60" : "#d8eddf"}
        color={active ? "#299E60" : "#d8eddf"}
      />
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 4,
          background: "#f0f7f3",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 4,
            background: active ? "#299E60" : "#f5a623",
            transition: "width .4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontFamily: "JetBrains Mono, monospace",
          color: "#a8c4b4",
          width: 28,
          textAlign: "right",
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Single review card
// ─────────────────────────────────────────────────────────────
function ReviewCard({ review, currentUserId, onHelpful, onEdit, onDelete }) {
  const isOwner = currentUserId && review.user?._id === currentUserId;
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #d8eddf",
        borderRadius: 14,
        padding: "18px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#299E60,#0d1f14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              fontFamily: "Outfit, sans-serif",
              flexShrink: 0,
            }}
          >
            {review.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#0d1f14",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              {review.user?.name || "User"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#a8c4b4",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              {date}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRow value={review.rating} readonly size={14} />
          {review.verifiedPurchase && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 10,
                color: "#299E60",
                fontFamily: "JetBrains Mono, monospace",
                background: "rgba(41,158,96,0.08)",
                padding: "2px 8px",
                borderRadius: 100,
              }}
            >
              <CheckCircle size={10} /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Title + Body */}
      {review.title && (
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0d1f14",
            fontFamily: "Fraunces, serif",
          }}
        >
          {review.title}
        </div>
      )}
      {review.body && (
        <p
          style={{ fontSize: 14, color: "#6b8577", lineHeight: 1.7, margin: 0 }}
        >
          {review.body}
        </p>
      )}

      {/* Images */}
      {review.images?.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img.url?.startsWith("/") ? `${BASE_URL}${img.url}` : img.url}
              alt=""
              style={{
                width: 72,
                height: 72,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #d8eddf",
                cursor: "pointer",
              }}
              onClick={() => window.open(img.url, "_blank")}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 4,
        }}
      >
        <button
          onClick={() => onHelpful(review._id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: review.markedHelpful
              ? "rgba(41,158,96,0.1)"
              : "#f5f9f6",
            border: `1px solid ${review.markedHelpful ? "rgba(41,158,96,0.3)" : "#d8eddf"}`,
            borderRadius: 100,
            padding: "5px 14px",
            cursor: "pointer",
            fontSize: 12,
            color: review.markedHelpful ? "#299E60" : "#6b8577",
            fontFamily: "Outfit, sans-serif",
            transition: "all .2s",
          }}
        >
          <ThumbsUp
            size={13}
            fill={review.markedHelpful ? "#299E60" : "none"}
            color={review.markedHelpful ? "#299E60" : "#6b8577"}
          />
          Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
        </button>

        {isOwner && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onEdit(review)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "1px solid #d8eddf",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: "#6b8577",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              <Edit2 size={12} /> Edit
            </button>
            <button
              onClick={() => onDelete(review._id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "1px solid #fde8e8",
                borderRadius: 8,
                padding: "5px 12px",
                cursor: "pointer",
                fontSize: 12,
                color: "#e53935",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Write / Edit form modal
// ─────────────────────────────────────────────────────────────
function ReviewFormModal({ productId, existing, onClose, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [title, setTitle] = useState(existing?.title || "");
  const [body, setBody] = useState(existing?.body || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!existing;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const url = isEdit
        ? `${BASE_URL}/api/reviews/${existing._id}`
        : `${BASE_URL}/api/reviews/${productId}`;
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");
      onSaved(data, isEdit);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          padding: "28px 28px 24px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          fontFamily: "Outfit, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          animation: "reviewModalIn .25s ease",
        }}
      >
        <style>{`@keyframes reviewModalIn { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:none; } }`}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 22,
              fontWeight: 900,
              color: "#0d1f14",
              margin: 0,
            }}
          >
            {isEdit ? "Edit your review" : "Write a review"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#a8c4b4",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Star rating */}
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6b8577",
              fontFamily: "JetBrains Mono, monospace",
              display: "block",
              marginBottom: 10,
            }}
          >
            Your Rating *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StarRow value={rating} onChange={setRating} size={32} />
            {rating > 0 && (
              <span style={{ fontSize: 14, color: "#299E60", fontWeight: 600 }}>
                {ratingLabels[rating]}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6b8577",
              fontFamily: "JetBrains Mono, monospace",
              display: "block",
              marginBottom: 8,
            }}
          >
            Review Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarise your experience"
            maxLength={120}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #d8eddf",
              borderRadius: 10,
              fontSize: 14,
              color: "#0d1f14",
              background: "#f5f9f6",
              outline: "none",
              fontFamily: "Outfit, sans-serif",
            }}
          />
        </div>

        {/* Body */}
        <div>
          <label
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#6b8577",
              fontFamily: "JetBrains Mono, monospace",
              display: "block",
              marginBottom: 8,
            }}
          >
            Your Review
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you like or dislike? How was the quality?"
            maxLength={2000}
            rows={5}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #d8eddf",
              borderRadius: 10,
              fontSize: 14,
              color: "#0d1f14",
              background: "#f5f9f6",
              outline: "none",
              fontFamily: "Outfit, sans-serif",
              resize: "vertical",
              lineHeight: 1.6,
            }}
          />
          <div
            style={{
              fontSize: 11,
              color: "#a8c4b4",
              textAlign: "right",
              marginTop: 4,
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {body.length}/2000
          </div>
        </div>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: "#e53935",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <X size={13} /> {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#f5f9f6",
              border: "1px solid #d8eddf",
              borderRadius: 10,
              fontSize: 14,
              color: "#6b8577",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "10px 24px",
              background: submitting ? "#a8c4b4" : "#299E60",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background .2s",
            }}
          >
            {submitting ? (
              <>
                <Loader
                  size={15}
                  style={{ animation: "spin .7s linear infinite" }}
                />{" "}
                Submitting…
              </>
            ) : isEdit ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main exported component
// ─────────────────────────────────────────────────────────────
export default function ReviewSection({
  productId,
  ratingsAverage = 0,
  ratingsCount = 0,
}) {
  const [reviews, setReviews] = useState([]);
  const [breakdown, setBreakdown] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [filterRating, setFilterRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  // Get current user id from token (decode JWT payload)
  useEffect(() => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload._id || payload.userId);
      }
    } catch (_) {}
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: currentPage, limit: 8, sort });
      if (filterRating) params.append("rating", filterRating);
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `${BASE_URL}/api/reviews/${productId}?${params}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setBreakdown(data.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

      // Check if current user already reviewed
      if (currentUserId) {
        const mine = (data.reviews || []).find(
          (r) => r.user?._id === currentUserId,
        );
        setUserHasReviewed(!!mine);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [productId, currentPage, sort, filterRating, currentUserId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleHelpful = async (reviewId) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return alert("Please log in to mark reviews as helpful.");
    try {
      const res = await fetch(
        `${BASE_URL}/api/reviews/${reviewId}/helpful`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                helpfulCount: data.helpfulCount,
                markedHelpful: data.marked,
              }
            : r,
        ),
      );
    } catch (_) {}
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete your review?")) return;
    const token = localStorage.getItem("accessToken");
    try {
      await fetch(
        `${BASE_URL}/api/reviews/${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchReviews();
    } catch (_) {}
  };

  const handleSaved = (saved, isEdit) => {
    setShowForm(false);
    setEditingReview(null);
    fetchReviews();
  };

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "highest", label: "Highest rated" },
    { value: "lowest", label: "Lowest rated" },
    { value: "helpful", label: "Most helpful" },
  ];

  return (
    <div
      id="reviews"
      style={{
        fontFamily: "Outfit, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        paddingTop: 40,
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .rv-write-btn:hover { background: #1e7a49 !important; transform: translateY(-1px); }
        .rv-sort-select:focus { outline: none; border-color: #299E60 !important; }
      `}</style>

      {/* ── Section heading ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: 26,
            fontWeight: 900,
            color: "#0d1f14",
            margin: 0,
          }}
        >
          Customer Reviews
          {total > 0 && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 400,
                color: "#a8c4b4",
                marginLeft: 10,
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              ({total})
            </span>
          )}
        </h2>
        {currentUserId && !userHasReviewed && (
          <button
            className="rv-write-btn"
            onClick={() => setShowForm(true)}
            style={{
              padding: "10px 22px",
              background: "#299E60",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(41,158,96,0.25)",
              transition: "all .2s",
            }}
          >
            <Star size={15} fill="#fff" color="#fff" /> Write a Review
          </button>
        )}
        {!currentUserId && (
          <span
            style={{
              fontSize: 13,
              color: "#a8c4b4",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Log in to write a review
          </span>
        )}
      </div>

      {/* ── Summary + breakdown ── */}
      {total > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 32,
            background: "#fff",
            border: "1px solid #d8eddf",
            borderRadius: 16,
            padding: "24px 28px",
            alignItems: "center",
          }}
        >
          {/* Average */}
          <div style={{ textAlign: "center", minWidth: 100 }}>
            <div
              style={{
                fontFamily: "Fraunces, serif",
                fontSize: 56,
                fontWeight: 900,
                color: "#0d1f14",
                lineHeight: 1,
              }}
            >
              {ratingsAverage.toFixed(1)}
            </div>
            <StarRow value={Math.round(ratingsAverage)} readonly size={18} />
            <div
              style={{
                fontSize: 12,
                color: "#a8c4b4",
                fontFamily: "JetBrains Mono, monospace",
                marginTop: 6,
              }}
            >
              {ratingsCount} reviews
            </div>
          </div>
          {/* Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[5, 4, 3, 2, 1].map((s) => (
              <BreakdownBar
                key={s}
                star={s}
                count={breakdown[s] || 0}
                total={total}
                active={filterRating === s}
                onClick={() => {
                  setFilterRating(filterRating === s ? null : s);
                  setCurrentPage(1);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      {total > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {filterRating && (
            <button
              onClick={() => {
                setFilterRating(null);
                setCurrentPage(1);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(41,158,96,0.1)",
                border: "1px solid rgba(41,158,96,0.3)",
                borderRadius: 100,
                padding: "5px 14px",
                cursor: "pointer",
                fontSize: 12,
                color: "#299E60",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              <Star size={11} fill="#299E60" color="#299E60" /> {filterRating}{" "}
              star <X size={12} />
            </button>
          )}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#6b8577",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Sort:
            </span>
            <div style={{ position: "relative" }}>
              <select
                className="rv-sort-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: "7px 32px 7px 12px",
                  border: "1px solid #d8eddf",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#0d1f14",
                  background: "#fff",
                  cursor: "pointer",
                  fontFamily: "Outfit, sans-serif",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "#6b8577",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Review list ── */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "40px 0",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #d8eddf",
              borderTopColor: "#299E60",
              borderRadius: "50%",
              animation: "spin .7s linear infinite",
            }}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#fff",
            border: "1px solid #d8eddf",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>✍️</div>
          <div
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 20,
              color: "#0d1f14",
              marginBottom: 6,
            }}
          >
            No reviews yet
          </div>
          <div style={{ fontSize: 14, color: "#a8c4b4" }}>
            Be the first to share your experience!
          </div>
          {currentUserId && !userHasReviewed && (
            <button
              className="rv-write-btn"
              onClick={() => setShowForm(true)}
              style={{
                marginTop: 20,
                padding: "10px 24px",
                background: "#299E60",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              Write a Review
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              currentUserId={currentUserId}
              onHelpful={handleHelpful}
              onEdit={(rev) => {
                setEditingReview(rev);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid",
                borderColor: p === currentPage ? "#299E60" : "#d8eddf",
                background: p === currentPage ? "#299E60" : "#fff",
                color: p === currentPage ? "#fff" : "#6b8577",
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Form modal ── */}
      {showForm && (
        <ReviewFormModal
          productId={productId}
          existing={editingReview}
          onClose={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOW TO USE IN ProductDetailPage.jsx
// ─────────────────────────────────────────────────────────────
//
// 1. Import at the top:
//    import ReviewSection from "../components/ReviewSection";
//
// 2. Inside the return, after the closing </div> of the pdp-grid,
//    still inside the max-width wrapper, add:
//
//    <ReviewSection
//      productId={product._id}
//      ratingsAverage={product.ratingsAverage}
//      ratingsCount={product.ratingsCount}
//    />
//
// Full placement example:
//
//   <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 48px" }}>
//     <div className="pdp-grid">
//       {/* ... existing 3 columns ... */}
//     </div>
//
//     {/* ── REVIEWS ── */}
//     <ReviewSection
//       productId={product._id}
//       ratingsAverage={product.ratingsAverage}
//       ratingsCount={product.ratingsCount}
//     />
//   </div>
