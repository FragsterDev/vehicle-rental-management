/**
 * Utility to calculate overdue status, grace period, and charges.
 * Policy: If the vehicle is not returned within 24 hours of the due date, overdue charges apply.
 */
export const getOverdueDetails = (booking, vehicle = null) => {
  if (!booking || !booking.returnDate) {
    return {
      isOverdue: false,
      isPast24Hours: false,
      overdueDays: 0,
      overdueCharges: 0,
      dailyRate: 0,
    };
  }

  const v = vehicle || booking.vehicle || {};
  const dailyRate =
    v.pricePerDay ||
    (booking.totalPrice && booking.days
      ? Math.round(booking.totalPrice / booking.days)
      : 0);

  const returnTime = new Date(booking.returnDate).getTime();
  const graceDeadline = returnTime + 24 * 60 * 60 * 1000; // 24-hour grace period

  const isReturned = booking.status === 'returned';
  const checkTime =
    isReturned && booking.actualReturnDate
      ? new Date(booking.actualReturnDate).getTime()
      : Date.now();

  const isOverdue = checkTime > returnTime;
  const isPast24Hours = checkTime > graceDeadline;

  if (!isOverdue) {
    return {
      isOverdue: false,
      isPast24Hours: false,
      overdueDays: 0,
      overdueCharges: 0,
      dailyRate,
      graceDeadline: new Date(graceDeadline),
    };
  }

  const diffMs = checkTime - returnTime;
  const overdueDays = Math.max(1, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));

  // If vehicle was not returned within 24 hours of due date, overdue charges apply
  let overdueCharges = 0;
  if (isPast24Hours) {
    overdueCharges =
      booking.overdueFee && booking.overdueFee > 0
        ? booking.overdueFee
        : overdueDays * dailyRate;
  }

  return {
    isOverdue: true,
    isPast24Hours,
    overdueDays,
    overdueCharges,
    dailyRate,
    graceDeadline: new Date(graceDeadline),
  };
};
