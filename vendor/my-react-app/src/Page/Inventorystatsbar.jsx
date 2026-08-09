const C = {
  green: "#299E60",
  greenGlow: "rgba(41,158,96,0.12)",
  greenBorder: "rgba(41,158,96,0.25)",
  border: "#d8eddf",
  bg: "#f5f9f6",
  bgCard: "#ffffff",
  text: "#5AB748",
  textMuted: "#6b8577",
  gold: "#f5a623",
  danger: "#e53935",
};

export default function InventoryStatsBar({ summary }) {
  if (!summary) return <StatsSkeleton />;

  const cards = [
    {
      label: "Total SKUs",
      value: summary.total,
      color: C.green,
      bg: C.greenGlow,
      border: C.greenBorder,
    },
    {
      label: "In Stock",
      value: summary.inStock,
      color: "#16a34a",
      bg: "rgba(22,163,74,0.08)",
      border: "rgba(22,163,74,0.2)",
    },
    {
      label: "Low Stock",
      value: summary.lowStock,
      color: C.gold,
      bg: "rgba(245,166,35,0.1)",
      border: "rgba(245,166,35,0.25)",
    },
    {
      label: "Out of Stock",
      value: summary.outOfStock,
      color: C.danger,
      bg: "rgba(229,57,53,0.08)",
      border: "rgba(229,57,53,0.2)",
    },
    {
      label: "Total Units",
      value: summary.totalUnits?.toLocaleString("en-IN"),
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.08)",
      border: "rgba(124,58,237,0.2)",
    },
    {
      label: "Inventory Value",
      value: `₹${Number(summary.totalValue || 0).toLocaleString("en-IN")}`,
      color: "#0369a1",
      bg: "rgba(3,105,161,0.08)",
      border: "rgba(3,105,161,0.2)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function StatCard({ label, value, icon, color, bg, border }) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        transition: "transform .15s, box-shadow .15s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          fontFamily: "JetBrains Mono,monospace",
          letterSpacing: "-0.5px",
        }}
      >
        {value ?? "—"}
      </div>
      <div
        style={{
          fontSize: 11,
          color: C.textMuted,
          fontFamily: "Outfit,sans-serif",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
        gap: 12,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 90,
            borderRadius: 12,
            background:
              "linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}
