const StatusBadge = ({ status }) => {
  const config = {
    draft: {
      bg: "#F3F4F6",
      color: "#6B7280",
      dot: "#9CA3AF",
      label: "Draft",
    },
    pending: {
      bg: "#FEF9C3",
      color: "#A16207",
      dot: "#EAB308",
      label: "Pending Review",
    },
    approved: {
      bg: "#DCFCE7",
      color: "#15803D",
      dot: "#22C55E",
      label: "Approved",
    },
    rejected: {
      bg: "#FEE2E2",
      color: "#B91C1C",
      dot: "#EF4444",
      label: "Rejected",
    },
  };

  const cfg = config[status] || config.draft;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
