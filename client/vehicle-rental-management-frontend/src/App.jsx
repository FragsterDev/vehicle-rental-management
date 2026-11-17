import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import VehicleCard from './components/VehicleCard';
import VehicleForm from './components/VehicleForm';
import AuthModal from './components/AuthModal';
import RentModal from './components/RentModal';
import FilterBar from './components/FilterBar';
import MyRentals from './components/MyRentals';
import AllBookings from './components/AllBookings';
import { getVehicles, addVehicle, updateVehicle, toggleVehicleAvailability, deleteVehicle } from './services/api';
import './App.css';

function App() {
  // Current user state (restored from localStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('vehicles'); // 'vehicles' | 'my-rentals' | 'all-bookings'
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);
  const [rentingVehicle, setRentingVehicle] = useState(null);

  // Filter States
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 3500);
  };

  // Fetch vehicles list
  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVehicles(selectedType, selectedStatus);
      setVehicles(data);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure the API is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vehicles') {
      loadVehicles();
    }
  }, [activeTab, selectedType, selectedStatus]);

  // Auth Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    showAlert(`Welcome, ${user.name}!`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('vehicles');
    showAlert('Signed out successfully.', 'info');
  };

  // Add / Edit Vehicle (Admin)
  const handleSaveVehicle = async (vehicleData, editId = null) => {
    if (editId) {
      const updated = await updateVehicle(editId, vehicleData);
      setVehicles((prev) => prev.map((v) => (v._id === editId ? updated : v)));
      showAlert(`Updated ${updated.make} ${updated.name} successfully.`);
    } else {
      const created = await addVehicle(vehicleData);
      setVehicles((prev) => [created, ...prev]);
      showAlert(`Added ${created.make} ${created.name} (${created.regNumber}) to fleet.`);
    }
    setVehicleToEdit(null);
  };

  // Toggle Availability (Admin)
  const handleToggleAvailability = async (id) => {
    try {
      const updated = await toggleVehicleAvailability(id);
      setVehicles((prev) => prev.map((v) => (v._id === id ? updated : v)));
      showAlert(
        `${updated.make} ${updated.name} is now ${updated.isAvailable ? 'available' : 'unavailable'} for rental.`
      );
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to update vehicle availability.', 'error');
    }
  };

  // Open Edit Modal
  const handleEditVehicle = (vehicle) => {
    setVehicleToEdit(vehicle);
    setIsAddVehicleOpen(true);
  };

  // Delete Vehicle (Admin)
  const handleDeleteVehicle = async (id, vehicleLabel) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${vehicleLabel}?`);
    if (!confirmed) return;

    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      showAlert(`Deleted ${vehicleLabel} from fleet.`, 'info');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete vehicle.', 'error');
    }
  };

  // Rent selection
  const handleSelectRent = (vehicle) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setRentingVehicle(vehicle);
  };

  const handleRentSuccess = (msg) => {
    showAlert(msg);
    loadVehicles();
  };

  // Filter vehicles by search term
  const filteredVehicles = vehicles.filter((v) => {
    const query = searchTerm.toLowerCase();
    return (
      v.name?.toLowerCase().includes(query) ||
      v.make?.toLowerCase().includes(query) ||
      v.regNumber?.toLowerCase().includes(query)
    );
  });

  // Reset to home view and clear filters
  const handleGoHome = () => {
    setActiveTab('vehicles');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchTerm('');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onGoHome={handleGoHome}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenAddForm={() => {
          setVehicleToEdit(null);
          setIsAddVehicleOpen(true);
        }}
      />

      <main className="main-content">
        {/* Notification Alert Banner */}
        {alert && (
          <div className={`notification-banner banner-${alert.type}`}>
            {alert.message}
          </div>
        )}

        {/* Tab 1: Vehicle Catalog */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="page-header">
              <div>
                <h2>Fleet Catalog</h2>
                <p className="page-description">Browse and rent available vehicles from our verified fleet.</p>
              </div>
            </div>

            <FilterBar
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onResetFilters={() => {
                setSelectedType('All');
                setSelectedStatus('All');
                setSearchTerm('');
              }}
            />

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading fleet inventory...</p>
              </div>
            )}

            {error && (
              <div className="error-banner">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={loadVehicles}>
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredVehicles.length > 0 ? (
                  <div className="vehicles-grid">
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard
                        key={vehicle._id}
                        vehicle={vehicle}
                        currentUser={currentUser}
                        onSelectRent={handleSelectRent}
                        onDeleteVehicle={handleDeleteVehicle}
                        onEditVehicle={handleEditVehicle}
                        onToggleAvailability={handleToggleAvailability}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No Vehicles Found</h3>
                    <p>No vehicles match your active search or filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 2: User's My Rentals */}
        {activeTab === 'my-rentals' && (
          <MyRentals
            onReturnSuccess={(msg) => {
              showAlert(msg);
              loadVehicles();
            }}
          />
        )}

        {/* Tab 3: Admin's All Bookings */}
        {activeTab === 'all-bookings' && (
          <AllBookings
            onActionSuccess={(msg) => {
              showAlert(msg);
              loadVehicles();
            }}
          />
        )}
      </main>

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Add / Edit Vehicle Modal (Admin Only) */}
      <VehicleForm
        isOpen={isAddVehicleOpen}
        onClose={() => {
          setIsAddVehicleOpen(false);
          setVehicleToEdit(null);
        }}
        onSaveVehicle={handleSaveVehicle}
        vehicleToEdit={vehicleToEdit}
      />

      {/* Rent Vehicle Modal */}
      <RentModal
        isOpen={!!rentingVehicle}
        vehicle={rentingVehicle}
        currentUser={currentUser}
        onClose={() => setRentingVehicle(null)}
        onRentSuccess={handleRentSuccess}
        onOpenAuth={() => {
          setRentingVehicle(null);
          setIsAuthModalOpen(true);
        }}
      />
    </div>
  );
}

export default App;
