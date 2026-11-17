import React from 'react';

function Navbar({ activeTab, onTabChange, onGoHome, currentUser, onOpenAuth, onSignOut, onOpenAddForm }) {
  const handleLogoClick = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      onTabChange('vehicles');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Clickable Brand Logo / Home link */}
        <div
          className="navbar-brand-section"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleLogoClick();
            }
          }}
          title="Return to Home (Vehicles Catalog)"
        >
          <span className="navbar-logo-text">DriveEase</span>
          <span className="navbar-subtitle">Fleet & Rental System</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          {currentUser && (
            <button
              className={`nav-tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => onTabChange('vehicles')}
            >
              Vehicles
            </button>
          )}

          {currentUser && (
            <button
              className={`nav-tab-btn ${activeTab === 'my-rentals' ? 'active' : ''}`}
              onClick={() => onTabChange('my-rentals')}
            >
              My Rentals
            </button>
          )}

          {currentUser?.role === 'admin' && (
            <button
              className={`nav-tab-btn ${activeTab === 'all-bookings' ? 'active' : ''}`}
              onClick={() => onTabChange('all-bookings')}
            >
              All Bookings
            </button>
          )}
        </nav>

        {/* User Account Controls */}
        <div className="navbar-auth-section">
          {currentUser ? (
            <div className="user-profile-badge">
              {currentUser.role === 'admin' && (
                <button className="btn btn-primary-sm" onClick={onOpenAddForm}>
                  + Add Vehicle
                </button>
              )}
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className={`role-badge role-${currentUser.role}`}>
                  {currentUser.role.toUpperCase()}
                </span>
              </div>
              <button className="btn btn-outline-sm" onClick={onSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
