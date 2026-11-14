import React from 'react';

function FilterBar({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  searchTerm,
  onSearchChange,
  onResetFilters,
}) {
  const vehicleTypes = ['All', 'Car', 'Bike', 'SUV', 'Truck', 'Van'];
  const statusOptions = ['All', 'Available', 'Rented'];

  return (
    <div className="filter-bar">
      <div className="filter-group search-group">
        <label htmlFor="search">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search by make, model, or registration number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-group">
        <label htmlFor="type-filter">Category</label>
        <select
          id="type-filter"
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="filter-select"
        >
          {vehicleTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-secondary" onClick={onResetFilters}>
        Reset
      </button>
    </div>
  );
}

export default FilterBar;
