import React, { useState, useEffect } from 'react';
import { getAllBookings, returnVehicle } from '../services/api';
import { generateInvoicePDF } from '../utils/generateInvoice';

function AllBookings({ onActionSuccess }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load system bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAdminReturn = async (bookingId, vehicleName) => {
    try {
      setActionLoading(bookingId);
      await returnVehicle(bookingId);
      onActionSuccess(`Marked ${vehicleName} as returned.`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(null);
    }
  };

  // Helper to calculate overdue days
  const getOverdueDays = (returnDate) => {
    const today = new Date();
    const ret = new Date(returnDate);
    const diff = today.getTime() - ret.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchBookings}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rentals-container">
      <div className="section-header">
        <div>
          <h2>All Customer Bookings</h2>
          <p className="section-meta">Admin overview of active, overdue, and completed rentals.</p>
        </div>
        <span className="badge-count">{bookings.length} Total</span>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">
          <h3>No Bookings Recorded</h3>
          <p>No customers have placed vehicle rental bookings yet.</p>
        </div>
      ) : (
        <div className="rentals-table-wrapper">
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Vehicle & Reg</th>
                <th>Booking Date</th>
                <th>Return Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const user = booking.user || {};
                const vehicle = booking.vehicle || {};
                const isOverdue =
                  booking.status === 'overdue' ||
                  (booking.status === 'active' && new Date() > new Date(booking.returnDate));
                const isReturned = booking.status === 'returned';
                const overdueDays = isOverdue ? getOverdueDays(booking.returnDate) : 0;

                return (
                  <tr key={booking._id} className={isOverdue ? 'row-overdue' : ''}>
                    <td>
                      <strong>{user.name || 'Unknown'}</strong>
                      <span className="subtext">{user.email || 'N/A'}</span>
                      <span className="subtext">{user.phone || 'N/A'}</span>
                    </td>
                    <td>
                      <strong>{vehicle.make} {vehicle.name}</strong>
                      <span className="font-mono subtext">{vehicle.regNumber || 'N/A'}</span>
                    </td>
                    <td>{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div>{new Date(booking.returnDate).toLocaleDateString()}</div>
                      {isOverdue && (
                        <span className="overdue-tag">
                          {overdueDays > 0 ? `${overdueDays} day(s) late` : 'Past deadline'}
                        </span>
                      )}
                      {isReturned && booking.actualReturnDate && (
                        <span className="subtext">
                          Returned on {new Date(booking.actualReturnDate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>₹{booking.totalPrice?.toLocaleString('en-IN')}</strong>
                      <span className="subtext">{booking.days} day(s)</span>
                      <span className="payment-tag-paid">
                        Paid: {booking.paymentMethod || 'UPI'}
                      </span>
                      {booking.paymentId && (
                        <span className="subtext font-mono" title={booking.paymentId}>
                          {booking.paymentId.substring(0, 16)}...
                        </span>
                      )}
                    </td>
                    <td>
                      {isOverdue && (
                        <span className="status-badge-inline status-overdue">
                          OVERDUE
                        </span>
                      )}
                      {!isOverdue && !isReturned && (
                        <span className="status-badge-inline status-active">
                          Active
                        </span>
                      )}
                      {isReturned && (
                        <span className="status-badge-inline status-returned">
                          Returned
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn btn-outline-sm btn-invoice"
                          onClick={() => generateInvoicePDF(booking)}
                          title="Download PDF Tax Invoice"
                        >
                          Invoice (PDF)
                        </button>
                        {!isReturned ? (
                          <button
                            className={`btn btn-outline-sm ${isOverdue ? 'btn-return-overdue' : ''}`}
                            disabled={actionLoading === booking._id}
                            onClick={() => handleAdminReturn(booking._id, `${vehicle.make} ${vehicle.name}`)}
                          >
                            {actionLoading === booking._id ? 'Updating...' : 'Mark Returned'}
                          </button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem', paddingLeft: '0.25rem' }}>Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AllBookings;
