import React, { useState, useEffect } from 'react';
import { getAllBookings, returnVehicle } from '../services/api';
import { generateInvoicePDF } from '../utils/generateInvoice';
import { getOverdueDetails } from '../utils/overdueUtils';

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
                <th>Customer & Contact</th>
                <th>Delivery Address</th>
                <th>Vehicle & Reg</th>
                <th>Booking Dates</th>
                <th>Billed & Overdue</th>
                <th>Status</th>
                <th>Admin Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const user = booking.user || {};
                const vehicle = booking.vehicle || {};
                const overdueInfo = getOverdueDetails(booking, vehicle);
                const isReturned = booking.status === 'returned';
                const { isOverdue, isPast24Hours, overdueDays, overdueCharges, dailyRate } = overdueInfo;
                const deliveryAddress = booking.deliveryAddress || user.address || 'Self Pickup / Counter';

                return (
                  <tr key={booking._id} className={isOverdue && isPast24Hours ? 'row-overdue' : ''}>
                    <td>
                      <strong>{user.name || 'Unknown'}</strong>
                      <span className="subtext">{user.email || 'N/A'}</span>
                      <span className="subtext">{user.phone || 'N/A'}</span>
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      <div className="admin-delivery-box" title={deliveryAddress}>
                        <span className="delivery-badge-label">Dispatch / Deliver to:</span>
                        <p className="delivery-address-text">{deliveryAddress}</p>
                      </div>
                    </td>
                    <td>
                      <strong>{vehicle.make} {vehicle.name}</strong>
                      <span className="font-mono subtext">{vehicle.regNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div><strong>From:</strong> {new Date(booking.bookingDate || booking.createdAt).toLocaleDateString()}</div>
                      <div><strong>Due:</strong> {new Date(booking.returnDate).toLocaleDateString()}</div>
                      {isOverdue && !isReturned && (
                        <>
                          {isPast24Hours ? (
                            <span className="overdue-tag">
                              {overdueDays} day(s) late
                            </span>
                          ) : (
                            <span className="grace-tag" title="Overdue, but currently within the 24h grace window">
                              Grace Period (&lt;24h)
                            </span>
                          )}
                        </>
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

                      {/* Display Overdue Fee if not returned within 24 hours */}
                      {isOverdue && !isReturned && isPast24Hours && (
                        <div className="overdue-charge-callout">
                          <span className="charge-title">Overdue Fee:</span>
                          <span className="charge-amount">₹{overdueCharges?.toLocaleString('en-IN')}</span>
                          <span className="charge-rate">({overdueDays}d late &times; ₹{dailyRate})</span>
                        </div>
                      )}

                      {/* Within 24-hour grace window */}
                      {isOverdue && !isReturned && !isPast24Hours && (
                        <div className="grace-charge-callout">
                          <span>Grace active: ₹0 late fee</span>
                        </div>
                      )}

                      {/* Already returned with overdue charges */}
                      {isReturned && booking.overdueFee > 0 && (
                        <div className="overdue-charge-callout settled">
                          <span className="charge-title">Overdue Fee:</span>
                          <span className="charge-amount">₹{booking.overdueFee.toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      {booking.paymentId && (
                        <span className="subtext font-mono" title={booking.paymentId}>
                          {booking.paymentId.substring(0, 16)}...
                        </span>
                      )}
                    </td>
                    <td>
                      {isOverdue && !isReturned && (
                        <span className={`status-badge-inline ${isPast24Hours ? 'status-overdue' : 'status-grace'}`}>
                          {isPast24Hours ? 'OVERDUE' : 'DUE (GRACE)'}
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
                            className={`btn btn-outline-sm ${isPast24Hours ? 'btn-return-overdue' : ''}`}
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
