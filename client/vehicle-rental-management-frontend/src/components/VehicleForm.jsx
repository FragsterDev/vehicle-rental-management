import React, { useState } from 'react';

function VehicleForm({ isOpen, onClose, onAddVehicle }) {
  const initialFormState = {
    make: '',
    name: '',
    regNumber: '',
    type: 'Car',
    pricePerDay: '',
    fuelType: 'Petrol',
    seatingCapacity: 4,
    image: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'image') {
      setPreviewError(false);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'regNumber' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.make.trim() || !formData.name.trim() || !formData.regNumber.trim()) {
      setError('Please provide vehicle make, model name, and registration number.');
      return;
    }
    if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) {
      setError('Please provide a valid positive rental price per day.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddVehicle({
        ...formData,
        image: formData.image.trim(),
        pricePerDay: Number(formData.pricePerDay),
        seatingCapacity: Number(formData.seatingCapacity),
      });
      setFormData(initialFormState);
      setPreviewError(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Vehicle</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="make">Make (Brand) *</label>
              <input
                type="text"
                id="make"
                name="make"
                placeholder="e.g. Toyota, Tesla"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Model Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Camry, Model 3"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="regNumber">Registration Number *</label>
              <input
                type="text"
                id="regNumber"
                name="regNumber"
                placeholder="e.g. KA-01-AB-1001"
                value={formData.regNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Vehicle Type *</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pricePerDay">Price Per Day (₹) *</label>
              <input
                type="number"
                id="pricePerDay"
                name="pricePerDay"
                placeholder="1500"
                min="1"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type</label>
              <select id="fuelType" name="fuelType" value={formData.fuelType} onChange={handleChange}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="seatingCapacity">Seating Capacity</label>
              <input
                type="number"
                id="seatingCapacity"
                name="seatingCapacity"
                min="1"
                max="50"
                value={formData.seatingCapacity}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL (Optional)</label>
              <input
                type="text"
                id="image"
                name="image"
                placeholder="Direct image link (https://... .jpg / .png)"
                value={formData.image}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Live Image Preview */}
          {formData.image && formData.image.trim() && (
            <div className="image-preview-box">
              <span className="preview-label">Live Image Preview:</span>
              <div className="preview-thumbnail-wrap">
                <img
                  src={formData.image.trim()}
                  alt="Vehicle Preview"
                  className="preview-thumbnail"
                  onError={() => setPreviewError(true)}
                  onLoad={() => setPreviewError(false)}
                />
                {previewError && (
                  <div className="preview-error-note">
                    Unable to load preview. Please ensure this is a direct image link (e.g. ending in .png, .jpg or hosted image).
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              placeholder="Vehicle notes, features, and condition..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleForm;
