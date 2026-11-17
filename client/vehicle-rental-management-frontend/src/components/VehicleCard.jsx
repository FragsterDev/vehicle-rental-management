import React, { useState, useEffect } from 'react';

// Category-based fallback images if custom URL fails or is empty
const CATEGORY_FALLBACKS = {
  Car: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
  Bike: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80',
  SUV: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=600&q=80',
  Truck: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=600&q=80',
  Van: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=600&q=80',
};

function VehicleCard({
  vehicle,
  currentUser,
  onSelectRent,
  onDeleteVehicle,
  onEditVehicle,
  onToggleAvailability,
}) {
  const { _id, make, name, regNumber, type, pricePerDay, isAvailable, image, fuelType, seatingCapacity, description } = vehicle;

  const getFallback = (vehicleType) => CATEGORY_FALLBACKS[vehicleType] || CATEGORY_FALLBACKS.Car;

  const [imgSrc, setImgSrc] = useState(() => (image && image.trim()) || getFallback(type));
  const [loadFailed, setLoadFailed] = useState(false);

  // Update image source if vehicle prop changes
  useEffect(() => {
    setImgSrc((image && image.trim()) || getFallback(type));
    setLoadFailed(false);
  }, [image, type]);

  const handleImageError = () => {
    if (!loadFailed) {
      setLoadFailed(true);
      setImgSrc(getFallback(type));
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className={`vehicle-card ${isAvailable ? 'card-available' : 'card-rented'}`}>
      <div className="card-image-wrapper">
        <img
          src={imgSrc}
          alt={`${make} ${name}`}
          className="card-image"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
        <div className="image-badges">
          <span className={`status-badge ${isAvailable ? 'badge-available' : 'badge-rented'}`}>
            {isAvailable ? 'Available' : 'Rented'}
          </span>
          <span className="type-badge">{type}</span>
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <div>
            <span className="vehicle-make">{make}</span>
            <h3 className="vehicle-name">{name}</h3>
          </div>
          <div className="vehicle-price">
            <span className="price-amount">₹{pricePerDay?.toLocaleString('en-IN')}</span>
            <span className="price-unit">/day</span>
          </div>
        </div>

        <div className="vehicle-reg">
          <span className="reg-label">Reg:</span>
          <span className="reg-number font-mono">{regNumber}</span>
        </div>

        <div className="vehicle-specs">
          <span className="spec-tag">{fuelType || 'Petrol'}</span>
          <span className="spec-tag">{seatingCapacity || 4} Seats</span>
        </div>

        <p className="vehicle-description">{description || 'No description provided.'}</p>

        <div className="card-actions">
          {isAvailable ? (
            <button className="btn btn-primary btn-full" onClick={() => onSelectRent(vehicle)}>
              Rent Vehicle
            </button>
          ) : (
            <button className="btn btn-disabled btn-full" disabled>
              Unavailable
            </button>
          )}

          {isAdmin && (
            <div className="admin-actions-bar">
              <button
                type="button"
                className={`btn btn-sm ${isAvailable ? 'btn-toggle-unavail' : 'btn-toggle-avail'}`}
                onClick={() => onToggleAvailability && onToggleAvailability(_id)}
                title={isAvailable ? 'Mark vehicle as Unavailable for rental' : 'Mark vehicle as Available for rental'}
              >
                {isAvailable ? 'Set Unavailable' : 'Set Available'}
              </button>
              <button
                type="button"
                className="btn btn-outline-sm"
                onClick={() => onEditVehicle && onEditVehicle(vehicle)}
                title="Edit vehicle details"
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-danger-sm"
                onClick={() => onDeleteVehicle(_id, `${make} ${name}`)}
                title="Delete Vehicle"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VehicleCard;
