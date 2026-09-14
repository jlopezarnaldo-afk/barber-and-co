import { useState } from 'react';
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

  // Preselections for booking wizard
  const [preselectedBranch, setPreselectedBranch] = useState<BranchId | undefined>(undefined);
  const [preselectedService, setPreselectedService] = useState<string | undefined>(undefined);

  // App data
  const [services, setServices] = useState<Service[]>(() => storageService.getServices());
  const [branches, setBranches] = useState<Branch[]>(() => storageService.getBranches());

  const handleRoleChange = (role: UserRole) => {
    storageService.setSessionRole(role);
    setCurrentRole(role);
    // Refresh services and branches in case admin modified them
    setServices(storageService.getServices());
    setBranches(storageService.getBranches());
  };

  const handleSelectService = (service: Service) => {
    setPreselectedService(service.id);
    const element = document.getElementById('reservar');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectBranch = (branchId: BranchId) => {
    setPreselectedBranch(branchId);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950">
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
          <Hero onStartBooking={scrollToBooking} onExploreServices={scrollToServices} />

          {/* Services Catalog */}
          <ServiceCatalog services={services} onSelectService={handleSelectService} />

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
