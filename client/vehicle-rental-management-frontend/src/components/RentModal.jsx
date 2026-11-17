import React, { useState } from 'react';
import { rentVehicle } from '../services/api';
import { generateInvoicePDF } from '../utils/generateInvoice';

function RentModal({ isOpen, vehicle, currentUser, onClose, onRentSuccess, onOpenAuth }) {
  const formatDateString = (date) => date.toISOString().split('T')[0];

  const todayStr = formatDateString(new Date());
  const defaultReturn = new Date();
  defaultReturn.setDate(defaultReturn.getDate() + 3);
  const defaultReturnStr = formatDateString(defaultReturn);

  // Workflow steps: 'dates' | 'payment' | 'success'
  const [step, setStep] = useState('dates');
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [returnDate, setReturnDate] = useState(defaultReturnStr);
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');

  // Keep deliveryAddress synchronized if currentUser loads/changes
  React.useEffect(() => {
    if (currentUser?.address && !deliveryAddress) {
      setDeliveryAddress(currentUser.address);
    }
  }, [currentUser]);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'Card' | 'NetBanking'
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8921 7842 1092');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('821');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing & Receipt state
  const [processing, setProcessing] = useState(false);
  const [processStatusText, setProcessStatusText] = useState('');
  const [completedBooking, setCompletedBooking] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen || !vehicle) return null;

  // Calculate days difference
  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    if (diff <= 0) return 1;
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const days = calculateDays(bookingDate, returnDate);
  const totalPrice = (vehicle.pricePerDay || 0) * days;

  const handleBookingDateChange = (val) => {
    setBookingDate(val);
    if (new Date(val) >= new Date(returnDate)) {
      const nextDay = new Date(val);
      nextDay.setDate(nextDay.getDate() + 1);
      setReturnDate(formatDateString(nextDay));
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (new Date(returnDate) <= new Date(bookingDate)) {
      setError('Return date must be at least 1 day after the booking date.');
      return;
    }
    if (!deliveryAddress || deliveryAddress.trim().length < 8) {
      setError('Please provide a complete delivery address with street, area, and city (min 8 characters).');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handleSimulatedPayment = async () => {
    setError('');
    setProcessing(true);
    setProcessStatusText('Connecting to payment gateway...');

    // Simulate realistic payment delay and steps
    await new Promise((r) => setTimeout(r, 600));
    setProcessStatusText('Verifying transaction with bank...');
    await new Promise((r) => setTimeout(r, 700));
    setProcessStatusText('Payment authorized. Securing rental booking...');

    try {
      const simPaymentId = `pay_sim_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
      const simOrderId = `order_sim_${Date.now()}`;

      let methodLabel = paymentMethod;
      if (paymentMethod === 'UPI') methodLabel = `UPI (${upiId || 'GPay'})`;
      if (paymentMethod === 'Card') methodLabel = `Card (ends in ${cardNumber.slice(-4) || '1092'})`;
      if (paymentMethod === 'NetBanking') methodLabel = `Net Banking (${selectedBank})`;

      const finalAddress = (deliveryAddress || '').trim() || currentUser?.address || 'Self Pickup / Counter';

      const res = await rentVehicle({
        vehicleId: vehicle._id,
        bookingDate,
        returnDate,
        days,
        deliveryAddress: finalAddress,
        paymentMethod: methodLabel,
        paymentId: simPaymentId,
        orderId: simOrderId,
      });

      setCompletedBooking({
        ...res.data,
        paymentId: simPaymentId,
        paymentMethod: methodLabel,
        deliveryAddress: finalAddress,
        totalPrice,
      });
      setStep('success');
      onRentSuccess(`Payment of ₹${totalPrice.toLocaleString('en-IN')} received. Rental confirmed!`);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment simulation failed. Please try again.');
      setStep('payment');
    } finally {
      setProcessing(false);
      setProcessStatusText('');
    }
  };

  const handleClose = () => {
    setStep('dates');
    setCompletedBooking(null);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            {step === 'dates' && 'Rent Vehicle'}
            {step === 'payment' && 'Complete Payment'}
            {step === 'success' && 'Payment Receipt'}
          </h2>
          <button className="btn-close" onClick={handleClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        {/* STEP 1: DATES & DURATION SELECTION */}
        {step === 'dates' && (
          <div>
            <div className="rental-summary-box">
              <div className="summary-item">
                <span className="summary-label">Vehicle:</span>
                <span className="summary-val">{vehicle.make} {vehicle.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Reg Number:</span>
                <span className="summary-val font-mono">{vehicle.regNumber}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Daily Rate:</span>
                <span className="summary-val">₹{vehicle.pricePerDay?.toLocaleString('en-IN')} / day</span>
              </div>
            </div>

            <form onSubmit={handleProceedToPayment} style={{ marginTop: '1.25rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bookingDate">Booking Date (Start) *</label>
                  <input
                    type="date"
                    id="bookingDate"
                    value={bookingDate}
                    min={todayStr}
                    onChange={(e) => handleBookingDateChange(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="returnDate">Return Date (End) *</label>
                  <input
                    type="date"
                    id="returnDate"
                    value={returnDate}
                    min={bookingDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Delivery Address Field */}
              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label htmlFor="deliveryAddress">
                  Vehicle Delivery Address *
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 42 MG Road, Indiranagar, Bengaluru"
                  required
                />
                <span className="field-hint" style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                  The admin will arrange doorstep vehicle delivery to this location.
                </span>
              </div>

              {/* 24-Hour Overdue Grace Period Notice */}
              <div className="overdue-policy-notice">
                <span className="policy-tag">Return Policy</span>
                <span className="policy-desc">
                  Vehicles returned within 24 hours of the due date incur no penalty. If not returned within 24 hours, overdue charges of ₹{vehicle.pricePerDay?.toLocaleString('en-IN')}/day apply for every overdue day.
                </span>
              </div>

              <div className="rental-cost-breakdown">
                <div className="cost-row">
                  <span>Daily Rate:</span>
                  <span>₹{vehicle.pricePerDay?.toLocaleString('en-IN')}</span>
                </div>
                <div className="cost-row">
                  <span>Calculated Days:</span>
                  <span>{days} day(s)</span>
                </div>
                <div className="cost-row total-cost-row">
                  <strong>Total Amount Payable:</strong>
                  <strong>₹{totalPrice.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                {currentUser ? (
                  <button type="submit" className="btn btn-primary">
                    Proceed to Payment (₹{totalPrice.toLocaleString('en-IN')})
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      handleClose();
                      onOpenAuth();
                    }}
                  >
                    Sign In to Rent
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: SIMULATED PAYMENT GATEWAY */}
        {step === 'payment' && (
          <div>
            <div className="payment-checkout-header">
              <div className="checkout-amount-box">
                <span className="checkout-label">Total Payable</span>
                <span className="checkout-price">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="checkout-meta font-mono">
                {vehicle.make} {vehicle.name} ({vehicle.regNumber}) | {days} day(s)
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="payment-methods-tabs">
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('UPI')}
              >
                UPI (GPay / PhonePe)
              </button>
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'Card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                Debit / Credit Card
              </button>
              <button
                type="button"
                className={`payment-tab-btn ${paymentMethod === 'NetBanking' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('NetBanking')}
              >
                Net Banking
              </button>
            </div>

            {/* Method Details */}
            <div className="payment-method-body">
              {paymentMethod === 'UPI' && (
                <div className="form-group">
                  <label htmlFor="upiId">Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    id="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi, user@okhdfcbank"
                  />
                  <div className="demo-fill-row">
                    <button
                      type="button"
                      className="btn-link-sm"
                      onClick={() => setUpiId('john.doe@okaxis')}
                    >
                      Fill Sample UPI: john.doe@okaxis
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div>
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 **** **** 1092"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="cardExpiry">Expiry Date</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="cardCvv">CVV</label>
                      <input
                        type="password"
                        id="cardCvv"
                        maxLength="4"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="***"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div className="form-group">
                  <label htmlFor="bankSelect">Select Bank</label>
                  <select
                    id="bankSelect"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="filter-select"
                    style={{ width: '100%' }}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            <div className="sandbox-notice">
              <span>Sandbox Test Mode: Simulated payment gateway. No real money will be deducted.</span>
            </div>

            {/* Processing Overlay */}
            {processing && (
              <div className="payment-processing-state">
                <div className="spinner"></div>
                <p className="processing-text">{processStatusText}</p>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={processing}
                onClick={() => setStep('dates')}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={processing}
                onClick={handleSimulatedPayment}
              >
                {processing ? 'Processing...' : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAYMENT RECEIPT & CONFIRMATION */}
        {step === 'success' && completedBooking && (
          <div className="payment-success-content">
            <div className="success-banner-box">
              <span className="success-status-tag">Payment Confirmed</span>
              <h3>Rental Booking Confirmed</h3>
              <p className="success-subtext">Your transaction has been processed and saved to the database.</p>
            </div>

            <div className="receipt-box">
              <div className="receipt-row">
                <span className="receipt-label">Amount Paid:</span>
                <span className="receipt-val font-bold">₹{completedBooking.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment ID:</span>
                <span className="receipt-val font-mono">{completedBooking.paymentId}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment Mode:</span>
                <span className="receipt-val">{completedBooking.paymentMethod}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Vehicle:</span>
                <span className="receipt-val">{vehicle.make} {vehicle.name}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Registration:</span>
                <span className="receipt-val font-mono">{vehicle.regNumber}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Rental Duration:</span>
                <span className="receipt-val">
                  {new Date(completedBooking.bookingDate).toLocaleDateString()} to {new Date(completedBooking.returnDate).toLocaleDateString()} ({days} days)
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Delivery To:</span>
                <span className="receipt-val">{completedBooking.deliveryAddress || 'Address on record'}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment Status:</span>
                <span className="receipt-val status-badge-inline status-active">Paid in Full</span>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => generateInvoicePDF(completedBooking, vehicle, currentUser)}
              >
                Download Invoice (PDF)
              </button>
              <button type="button" className="btn btn-primary" onClick={handleClose}>
                Done & View Fleet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RentModal;
