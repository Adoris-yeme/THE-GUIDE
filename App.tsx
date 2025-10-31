import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, Outlet, Navigate } from 'react-router-dom';
import { AppStoreProvider, useAppStore } from './hooks/useAppStore';
import { I18nProvider, useI18n } from './i18n';
import { Home, Tours, TourDetail, About, GalleryAndTestimonials, Contact, BlogList, BlogPostDetail, Wishlist } from './pages/PublicPages';
import { AdminPages } from './pages/AdminPages';
import { Button, Card, Input } from './components/ui';

const SunIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const BookingModal = () => {
    const { 
        tours, 
        addBooking, 
        isBookingModalOpen, 
        bookingModalTourId, 
        closeBookingModal 
    } = useAppStore();
    const { t } = useI18n();

    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [whatsappLink, setWhatsappLink] = useState('');
    const [selectedTourId, setSelectedTourId] = useState('');

    const publishedTours = useMemo(() => tours.filter(t => t.status === 'published'), [tours]);

    // Effect to set initial state and reset form when the modal opens
    useEffect(() => {
        if (isBookingModalOpen) {
            const defaultTourId = publishedTours.length > 0 ? publishedTours[0].id : '';
            setSelectedTourId(bookingModalTourId || defaultTourId);
            setSubmissionStatus('idle');
            setWhatsappLink('');
        }
    }, [isBookingModalOpen, bookingModalTourId, publishedTours]);

    if (!isBookingModalOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const tourId = selectedTourId;
            const customerName = data.customerName as string;
            const customerEmail = data.customerEmail as string;
            const customerPhone = data.customerPhone as string;
            const numberOfPeople = parseInt(data.numberOfPeople as string, 10);
            
            const tour = tours.find(t => t.id === tourId);
            if (!tour) throw new Error("Tour not found");

            addBooking({ tourId, customerName, customerEmail, customerPhone, numberOfPeople });
            
            const message = `Bonjour Le Guide BJ, je souhaite faire une demande de réservation pour le circuit "${tour.title}".\n\n- Nom: ${customerName}\n- Email: ${customerEmail}\n- Téléphone: ${customerPhone}\n- Personnes: ${numberOfPeople}\n\nMerci de confirmer la disponibilité.`;
            const whatsappUrl = `https://wa.me/22952030744?text=${encodeURIComponent(message)}`;

            setWhatsappLink(whatsappUrl);
            setSubmissionStatus('success');
        } catch {
            setSubmissionStatus('error');
        }
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4"
            onClick={closeBookingModal}
        >
            <div 
                className="bg-brand-light dark:bg-brand-dark rounded-lg shadow-2xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-brand-secondary/50">
                    <h2 className="text-2xl font-bold text-brand-dark dark:text-white">{t('booking.title')}</h2>
                    <button onClick={closeBookingModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl">&times;</button>
                </div>

                <div className="p-6">
                    {submissionStatus === 'success' ? (
                        <div className="text-center">
                             <p className="font-bold text-lg text-green-700 dark:text-green-300">{t('booking.successTitle')}</p>
                            <p className="mt-2 text-brand-dark dark:text-brand-light">{t('booking.successText')}</p>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-block mt-4">
                                <Button variant="secondary">{t('booking.whatsappButton')}</Button>
                            </a>
                            <button onClick={closeBookingModal} className="mt-4 block w-full text-center text-sm text-gray-600 dark:text-gray-400 hover:underline">
                                {t('booking.closeButton')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="tourId" className="block text-sm font-medium text-brand-dark dark:text-brand-light/70">{t('booking.chooseTour')}</label>
                                <select id="tourId" name="tourId" value={selectedTourId} onChange={e => setSelectedTourId(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-brand-secondary bg-white dark:bg-brand-dark/50 text-brand-dark dark:text-brand-light focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
                                  {publishedTours.map(tour => <option key={tour.id} value={tour.id}>{tour.title}</option>)}
                                </select>
                            </div>
                            <Input label={t('booking.fullName')} id="customerName" name="customerName" type="text" required />
                            <Input label={t('booking.email')} id="customerEmail" name="customerEmail" type="email" required />
                            <Input label={t('booking.phone')} id="customerPhone" name="customerPhone" type="tel" required />
                            <Input label={t('booking.peopleCount')} id="numberOfPeople" name="numberOfPeople" type="number" min="1" required />
                            <Button type="submit" variant="primary" className="w-full">{t('booking.submitButton')}</Button>
                            {submissionStatus === 'error' && <p className="text-red-500 text-sm mt-2">{t('booking.error')}</p>}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, wishlist, theme, setTheme } = useAppStore();
    const { lang, setLang, t } = useI18n();

    const navLinks = [
        { to: "/", label: t('header.home') },
        { to: "/circuits", label: t('header.tours') },
        { to: "/blog", label: t('header.blog') },
        { to: "/a-propos", label: t('header.about') },
        { to: "/galerie", label: t('header.gallery') },
        { to: "/contact", label: t('header.contact') },
    ];
    
    const ThemeSwitcher = ({className}: {className?: string}) => (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={`p-2 rounded-full text-white hover:bg-white/20 transition-colors ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>
    );

    const LanguageSwitcher = ({className}: {className?: string}) => (
         <div className={`flex items-center space-x-1 ${className}`}>
            <button onClick={() => setLang('fr')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'fr' ? 'bg-brand-accent text-brand-dark' : 'text-white hover:text-brand-accent/80'}`}>FR</button>
            <span className="text-gray-400">/</span>
            <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${lang === 'en' ? 'bg-brand-accent text-brand-dark' : 'text-white hover:text-brand-accent/80'}`}>EN</button>
        </div>
    );

    const NavLinksComponent = ({ className }: {className?: string}) => (
        <div className={className}>
            {navLinks.map(link => <NavLink key={link.to} to={link.to} className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-brand-accent' : 'text-white hover:text-brand-accent'}`}>{link.label}</NavLink>)}
            <NavLink to="/wishlist" className={({ isActive }) => `relative px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'text-brand-accent' : 'text-white hover:text-brand-accent'}`}>
                {t('header.wishlist')}
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-xs font-bold text-brand-dark">{wishlist.length}</span>}
            </NavLink>
            {isAuthenticated && <Link to="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-brand-accent text-brand-dark hover:bg-brand-accent/80">Admin</Link>}
            <ThemeSwitcher />
            <LanguageSwitcher className={className?.includes('flex-col') ? 'pt-2' : ''} />
        </div>
    );

    return (
        <header className="bg-brand-primary/95 backdrop-blur-sm sticky top-0 z-50 shadow-lg">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-2xl font-bold">
                           <span className="text-brand-accent">Le Guide</span> BJ
                        </Link>
                    </div>
                    <div className="hidden md:block">
                       <NavLinksComponent className="ml-10 flex items-center space-x-2" />
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            {isOpen ? 
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> :
                              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            }
                        </button>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="md:hidden">
                    <NavLinksComponent className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-start" />
                </div>
            )}
        </header>
    );
};

const Footer = () => {
    const { t } = useI18n();
    const { openBookingModal } = useAppStore();
    return (
        <footer className="bg-brand-primary text-white">
            <div className="max-w-screen-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold text-brand-accent">{t('footer.aboutTitle')}</h3>
                        <p className="mt-2 text-gray-300">{t('footer.aboutText')}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">{t('footer.quickLinks')}</h3>
                        <ul className="mt-2 space-y-2 text-gray-300">
                            <li><Link to="/circuits" className="hover:text-brand-accent">{t('header.tours')}</Link></li>
                            <li><Link to="/blog" className="hover:text-brand-accent">{t('header.blog')}</Link></li>
                            <li><button onClick={() => openBookingModal(null)} className="hover:text-brand-accent">Réserver</button></li>
                            <li><Link to="/contact" className="hover:text-brand-accent">{t('header.contact')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200">{t('footer.contactUs')}</h3>
                        <ul className="mt-2 space-y-2 text-gray-300">
                            <li>leguidebj@gmail.com</li>
                            <li>+229 52 03 07 44</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-green-800 pt-8 text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Le Guide BJ. {t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
}

const PublicLayout = () => (
    <>
        <Header />
        <main><Outlet /></main>
        <Footer />
    </>
);

const ThemeManager = () => {
    const { theme } = useAppStore();
    useEffect(() => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }, [theme]);
    return null;
}

function App() {
  return (
    <AppStoreProvider>
      <I18nProvider>
          <ThemeManager />
          <BookingModal />
          <HashRouter>
            <Routes>
              {/* Admin Routes */}
              <Route path="/login" element={<AdminPages.Login />} />
              <Route path="/admin" element={<AdminPages.AdminRoute />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminPages.AdminDashboard />} />
                  <Route path="homepage" element={<AdminPages.ManageHomepage />} />
                  <Route path="tours" element={<AdminPages.ManageTours />} />
                  <Route path="tours/add" element={<AdminPages.ManageTourForm />} />
                  <Route path="tours/edit/:tourId" element={<AdminPages.ManageTourForm />} />
                  <Route path="experiences" element={<AdminPages.ManageExperiences />} />
                  <Route path="blog" element={<AdminPages.ManageBlog />} />
                  <Route path="bookings" element={<AdminPages.ManageBookings />} />
                  <Route path="messages" element={<AdminPages.ManageMessages />} />
                  <Route path="testimonials" element={<AdminPages.ManageTestimonials />} />
              </Route>
              
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="circuits" element={<Tours />} />
                <Route path="circuits/:tourId" element={<TourDetail />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="blog" element={<BlogList />} />
                <Route path="blog/:postId" element={<BlogPostDetail />} />
                <Route path="a-propos" element={<About />} />
                <Route path="galerie" element={<GalleryAndTestimonials />} />
                <Route path="contact" element={<Contact />} />
              </Route>
            </Routes>
          </HashRouter>
      </I18nProvider>
    </AppStoreProvider>
  );
}

export default App;