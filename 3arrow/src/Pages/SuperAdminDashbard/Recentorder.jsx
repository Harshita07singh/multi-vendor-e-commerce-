export default function RecentBookings() {
  const bookings = [
    { id: '#00001', name: 'Fruits',          status: 'Confirmed' },
    { id: '#00002', name: 'vegetable',         status: 'Pending'   },
    { id: '#00003', name: 'Mango',   status: 'Confirmed' },
    { id: '#00004', name: 'Apple',          status: 'Confirmed' },
  ];

  const statusStyle = (status) => {
    switch (status) {
      case 'Confirmed': return { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' };
      case 'Pending':   return { bg: '#FEF9C3', color: '#A16207', dot: '#EAB308' };
      case 'Cancelled': return { bg: '#FEE2E2', color: '#B91C1C', dot: '#EF4444' };
      default:          return { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' };
    }
  };

  return (
    <div className="px-4 md:px-6 pb-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Recent Orders</h3>
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: '#F0FDF4', color: '#299E60' }}
          >
            View All
          </button>
        </div>

        {/* Table — desktop */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tour Name</th>
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => {
                const s = statusStyle(booking.status);
                return (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="text-sm font-semibold text-gray-700">{booking.id}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-sm text-gray-800">{booking.name}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ background: s.bg, color: s.color }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button className="text-xs text-gray-400 hover:text-gray-600 transition-colors font-medium">
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards — mobile */}
        <div className="sm:hidden divide-y divide-gray-50">
          {bookings.map((booking, index) => {
            const s = statusStyle(booking.status);
            return (
              <div key={index} className="px-4 py-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">{booking.id}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{booking.name}</p>
                </div>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                  {booking.status}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}