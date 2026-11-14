import React, { useState, useEffect } from 'react';
import { getMyRentals, returnVehicle } from '../services/api';
import { generateInvoicePDF } from '../utils/generateInvoice';

function MyRentals({ onReturnSuccess }) {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getMyRentals();
      setRentals(data);
    } catch (err) {
      setError('Failed to load your rentals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleReturn = async (bookingId, vehicleName) => {
    try {
      setActionLoading(bookingId);
      await returnVehicle(bookingId);
      onReturnSuccess(`Successfully returned ${vehicleName}.`);
      fetchRentals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return vehicle.');
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
        <p>Loading your rentals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-banner">
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchRentals}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rentals-container">
      <div className="section-header">
        <div>
          <h2>My Rentals</h2>
          <p className="section-meta">Track your active bookings, return deadlines, and completed rentals.</p>
        </div>
        <span className="badge-count">{rentals.length} Total Bookings</span>
      </div>

      {rentals.length === 0 ? (
        <div className="empty-state">
          <h3>No Rentals Found</h3>
          <p>You have not rented any vehicles yet. Explore available fleet vehicles to place a booking.</p>
        </div>
      ) : (
        <div className="rentals-table-wrapper">
          <table className="minimal-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Reg Number</th>
                <th>Booking Date</th>
                <th>Return Date</th>
                <th>Duration</th>
                <th>Total Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => {
                const vehicle = rental.vehicle || {};
                const isOverdue =
                  rental.status === 'overdue' ||
                  (rental.status === 'active' && new Date() > new Date(rental.returnDate));
                const isReturned = rental.status === 'returned';
                const overdueDays = isOverdue ? getOverdueDays(rental.returnDate) : 0;

                return (
                  <tr key={rental._id} className={isOverdue ? 'row-overdue' : ''}>
                    <td>
                      <strong>{vehicle.make} {vehicle.name}</strong>
                      <span className="subtext">{vehicle.type}</span>
                    </td>
                    <td className="font-mono">{vehicle.regNumber || 'N/A'}</td>
                    <td>{new Date(rental.bookingDate || rental.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div>{new Date(rental.returnDate).toLocaleDateString()}</div>
                      {isOverdue && (
                        <span className="overdue-tag">
                          {overdueDays > 0 ? `${overdueDays} day(s) late` : 'Past deadline'}
                        </span>
                      )}
                      {isReturned && rental.actualReturnDate && (
                        <span className="subtext">
                          Returned on {new Date(rental.actualReturnDate).toLocaleDateString()}
                        </span>
                      )}
                    </td>
                    <td>
                      <strong>₹{rental.totalPrice?.toLocaleString('en-IN')}</strong>
                      <span className="subtext">{rental.days} day(s)</span>
                      <span className="payment-tag-paid">
                        Paid: {rental.paymentMethod || 'UPI'}
                      </span>
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
                          onClick={() => generateInvoicePDF(rental)}
                          title="Download PDF Tax Invoice"
                        >
                          Invoice (PDF)
                        </button>
                        {!isReturned ? (
                          <button
                            className={`btn btn-outline-sm ${isOverdue ? 'btn-return-overdue' : ''}`}
                            disabled={actionLoading === rental._id}
                            onClick={() => handleReturn(rental._id, `${vehicle.make} ${vehicle.name}`)}
                          >
                            {actionLoading === rental._id ? 'Returning...' : 'Return Vehicle'}
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

export default MyRentals;
