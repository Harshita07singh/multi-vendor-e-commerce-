const StatusBadge = ({ status }) => {
  const styles = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const labels = {
    draft: "Draft",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
