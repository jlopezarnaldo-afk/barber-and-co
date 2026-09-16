import { useState, useEffect } from 'react';
import type { UserRole, Service, Branch, BranchId } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServiceCatalog } from './components/ServiceCatalog';
import { BookingWizard } from './components/BookingWizard';
import { BranchesShowcase } from './components/BranchesShowcase';
import { BrandPerks } from './components/BrandPerks';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { PinLockModal } from './components/PinLockModal';
import { StaffPanel } from './components/StaffPanel';
import { AdminPanel } from './components/AdminPanel';

export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => storageService.getSessionRole());
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);

  // Active branch selected across Hero and Service Catalog
  const [activeBranchId, setActiveBranchId] = useState<BranchId>('palermo');

  // Preselections for booking wizard
  const [preselectedBranch, setPreselectedBranch] = useState<BranchId | undefined>('palermo');
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  // App data
  const [services, setServices] = useState<Service[]>(() => storageService.getServices());
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());

  // Listen to cross-component and cross-tab service price/duration updates
  useEffect(() => {
    const handleServicesUpdated = () => {
      setServices(storageService.getServices());
      setBranches(storageService.getBranches());
    };
    const handleStorageEvent = (e: StorageEvent) => {
      if (!e.key || e.key === 'barber_services') {
        setServices(storageService.getServices());
      }
      if (!e.key || e.key === 'barber_branches') {
        setBranches(storageService.getBranches());
      }
    };
    window.addEventListener('barber_services_updated', handleServicesUpdated);
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('barber_services_updated', handleServicesUpdated);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const handleRoleChange = (role: UserRole) => {
    storageService.setSessionRole(role);
    setCurrentRole(role);
    // Refresh services and branches in case admin modified them
    setServices(storageService.getServices());
    setBranches(storageService.getBranches());
  };

  const handleSelectBranch = (branchId: BranchId) => {
    setActiveBranchId(branchId);
    setPreselectedBranch(branchId);
    const element = document.getElementById('reservar');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectService = (service: Service) => {
    setPreselectedService(service.id);
    setPreselectedBranch(activeBranchId);
    const element = document.getElementById('reservar');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToBooking = () => {
    const element = document.getElementById('reservar');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToServices = () => {
    const element = document.getElementById('servicios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen min-h-dvh bg-[#ECE7DE] text-[#141210] font-sans selection:bg-[#DDD6C8] selection:text-[#141210] overflow-x-hidden">
      {/* Global Navbar */}
      <Navbar
        currentRole={currentRole}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        onLogout={() => handleRoleChange('guest')}
        onNavigateToBooking={scrollToBooking}
      />

      {/* CONDITIONAL VIEWS BASED ON ROLE */}
      {currentRole === 'staff' ? (
        <StaffPanel onLogout={() => handleRoleChange('guest')} />
      ) : currentRole === 'admin' ? (
        <AdminPanel onLogout={() => handleRoleChange('guest')} />
      ) : (
        <main>
          {/* Hero Section */}
          <Hero
            activeBranchId={activeBranchId}
            onSelectBranch={(branchId) => {
              setActiveBranchId(branchId);
              setPreselectedBranch(branchId);
            }}
            onStartBooking={scrollToBooking}
            onExploreServices={scrollToServices}
          />

          {/* Services Catalog */}
          <ServiceCatalog
            services={services}
            activeBranchId={activeBranchId}
            onSelectService={handleSelectService}
            onSelectBranch={(branchId) => {
              setActiveBranchId(branchId);
              setPreselectedBranch(branchId);
            }}
          />

          {/* Interactive Booking Wizard */}
          <BookingWizard
            key={`${preselectedBranch || 'default'}-${preselectedService || 'default'}`}
            initialBranchId={preselectedBranch}
            initialServiceId={preselectedService}
          />

          {/* Branches Showcase */}
          <BranchesShowcase
            branches={branches}
            onSelectBranchForBooking={handleSelectBranch}
          />

          {/* Experience & Perks */}
          <BrandPerks />

          {/* Reviews & Social Proof */}
          <ReviewsSection />

          {/* Footer */}
          <Footer
            onOpenPinModal={() => setIsPinModalOpen(true)}
            onNavigateToBooking={scrollToBooking}
          />
        </main>
      )}

      {/* Security Pin Lock Keypad Modal */}
      <PinLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleRoleChange}
      />
    </div>
  );
}

export default App;
