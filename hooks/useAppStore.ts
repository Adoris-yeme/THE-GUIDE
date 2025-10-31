import React, { createContext, useContext, useState, useEffect, PropsWithChildren, useMemo, useCallback } from 'react';
import type { Tour, Booking, Message, Testimonial, BlogPost, HomePageContent, Experience } from '../types';

// --- MOCK DATA ---
const initialTours: Tour[] = [
  { id: '1', title: 'Aventure à Ganvié', description: 'Découvrez la vie sur l\'eau dans la plus grande cité lacustre d\'Afrique. Une expérience culturelle inoubliable.', price: 450, duration: '3 jours', imageUrl: 'https://picsum.photos/seed/ganvie/600/400', status: 'published', category: 'Culture', itinerary: [{ day: 1, title: 'Arrivée et immersion', description: 'Arrivée à Ganvié, installation dans votre bungalow sur pilotis. Première exploration en barque du village et du marché flottant.' },{ day: 2, title: 'Vie locale et traditions', description: 'Visite d\'une école locale, rencontre avec les pêcheurs et découverte des techniques de pêche traditionnelles. Dîner chez l\'habitant.' },{ day: 3, title: 'Détente et départ', description: 'Matinée libre pour vous imprégner de l\'atmosphère unique. Retour vers Cotonou en début d\'après-midi.' },], gallery: ['https://picsum.photos/seed/ganvie-g1/800/600', 'https://picsum.photos/seed/ganvie-g2/800/600', 'https://picsum.photos/seed/ganvie-g3/800/600'], included: ['Hébergement en bungalow', 'Tous les repas mentionnés', 'Transports en barque', 'Guide local francophone'], excluded: ['Boissons', 'Dépenses personnelles', 'Pourboires'], tags: ['Culture', 'Insolite', 'Lac'] },
  { id: '2', title: 'Royaumes d\'Abomey', description: 'Plongez dans l\'histoire des puissants rois du Dahomey en visitant les palais royaux classés au patrimoine mondial de l\'UNESCO.', price: 600, duration: '5 jours', imageUrl: 'https://picsum.photos/seed/abomey/600/400', status: 'published', category: 'Histoire', itinerary: [{ day: 1, title: 'Route vers Abomey', description: 'Départ de Cotonou, visite du village souterrain d\'Agongointo-Zoungoudo en chemin. Arrivée et installation à Abomey.' },{ day: 2, title: 'Palais Royaux', description: 'Journée consacrée à la visite des palais royaux, classés UNESCO. Découverte de l\'histoire, des bas-reliefs et des trônes.' },{ day: 3, title: 'Artisanat local', description: 'Rencontre avec des artisans locaux : forgerons, tisserands et sculpteurs sur bois. Atelier participatif.' },{ day: 4, title: 'Culture et Vaudou', description: 'Exploration des temples et couvents vaudou de la région pour comprendre cette spiritualité profonde.' },{ day: 5, title: 'Retour vers la côte', description: 'Matinée libre pour les derniers achats au marché artisanal, puis retour vers Cotonou.' },], gallery: ['https://picsum.photos/seed/abomey-g1/800/600', 'https://picsum.photos/seed/abomey-g2/800/600'], included: ['Hébergement en hôtel', 'Petits-déjeuners', 'Entrées des sites', 'Guide historien'], excluded: ['Déjeuners et dîners', 'Boissons', 'Transports inter-villes'], tags: ['Histoire', 'UNESCO', 'Royauté'] },
  { id: '3', title: 'Safari au Parc Pendjari', description: 'Observez la faune sauvage africaine dans son habitat naturel. Éléphants, lions, guépards vous attendent.', price: 1200, duration: '7 jours', imageUrl: 'https://picsum.photos/seed/pendjari/600/400', status: 'published', category: 'Safari', itinerary: [{ day: 1, title: 'En route pour le Nord', description: 'Vol matinal de Cotonou à Natitingou. Transfert vers le parc et installation au lodge.' },{ day: 2, title: 'Premiers safaris', description: 'Safari matinal et crépusculaire pour observer les animaux à leur pic d\'activité.' },{ day: 3, title: 'Au cœur du parc', description: 'Journée complète de safari avec pique-nique en brousse. Recherche des grands prédateurs.' },{ day: 4, title: 'Chutes de Tanougou', description: 'Excursion vers les rafraîchissantes chutes de Tanougou pour une baignade.' },{ day: 5, title: 'Pays Somba', description: 'Visite des villages Somba et de leurs "tata", des habitations fortifiées uniques.' },{ day: 6, title: 'Dernier safari', description: 'Un dernier safari matinal pour dire au revoir à la faune de Pendjari.' },{ day: 7, title: 'Retour', description: 'Route vers Natitingou pour le vol de retour vers Cotonou.' },], gallery: ['https://picsum.photos/seed/pendjari-g1/800/600', 'https://picsum.photos/seed/pendjari-g2/800/600', 'https://picsum.photos/seed/pendjari-g3/800/600', 'https://picsum.photos/seed/pendjari-g4/800/600'], included: ['Vols internes', 'Hébergement en lodge', 'Pension complète', 'Véhicule 4x4 avec chauffeur-guide'], excluded: ['Boissons alcoolisées', 'Pourboires'], tags: ['Safari', 'Nature', 'Animaux', 'Aventure'] },
  { id: '4', title: 'Porto-Novo la Capitale', description: 'Explorez la capitale colorée du Bénin, avec son architecture afro-brésilienne unique et ses marchés animés.', price: 350, duration: '2 jours', imageUrl: 'https://picsum.photos/seed/porto-novo/600/400', status: 'draft', category: 'Culture', itinerary: [], gallery: [], included: [], excluded: [], tags: ['Culture', 'Ville'] }
];
const initialBookings: Booking[] = [
  { id: 'b1', tourId: '3', tourTitle: 'Safari au Parc Pendjari', customerName: 'Alice Martin', customerEmail: 'alice@example.com', customerPhone: '0123456789', numberOfPeople: 2, bookingDate: new Date().toISOString(), status: 'Confirmée' },
  { id: 'b2', tourId: '1', tourTitle: 'Aventure à Ganvié', customerName: 'John Doe', customerEmail: 'john@example.com', customerPhone: '0987654321', numberOfPeople: 4, bookingDate: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'Confirmée' },
  { id: 'b3', tourId: '2', tourTitle: 'Royaumes d\'Abomey', customerName: 'Jane Smith', customerEmail: 'jane@example.com', customerPhone: '1122334455', numberOfPeople: 1, bookingDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'En attente' },
];
const initialMessages: Message[] = [
    { id: 'm1', name: 'Bob Dupont', email: 'bob@example.com', subject: 'Question sur le circuit Abomey', message: 'Bonjour, j\'aimerais avoir plus d\'informations sur les hébergements.', date: new Date().toISOString(), read: false }
];
const initialTestimonials: Testimonial[] = [
    { id: 't1', author: 'Claire Dubois', reviewText: 'Un voyage exceptionnel ! L\'organisation était parfaite et les guides passionnants. Le Bénin est un pays magnifique.', imageUrl: 'https://picsum.photos/seed/claire/100/100', rating: 5, status: 'approved' },
    { id: 't2', author: 'Marc Petit', reviewText: 'Le safari à Pendjari a dépassé toutes nos attentes. Merci au Guide BJ pour ces souvenirs inoubliables.', imageUrl: 'https://picsum.photos/seed/marc/100/100', rating: 5, status: 'approved' },
    { id: 't3', author: 'Sophie Durand', reviewText: 'Très belle expérience à Ganvié, même si la météo était un peu capricieuse. Je recommande vivement.', imageUrl: 'https://picsum.photos/seed/sophie/100/100', rating: 4, status: 'pending' },
    { id: 't4', author: 'Lucas Bernard', reviewText: 'Abomey est un site historique fascinant. Une plongée dans l\'histoire du Dahomey.', imageUrl: 'https://picsum.photos/seed/lucas/100/100', rating: 5, status: 'approved' },
    { id: 't5', author: 'Emma Leroy', reviewText: 'Les couleurs et l\'ambiance de Porto-Novo sont uniques. J\'ai adoré !', imageUrl: 'https://picsum.photos/seed/emma/100/100', rating: 4, status: 'approved' },
    { id: 't6', author: 'Adrien Moreau', reviewText: 'Organisation impeccable du début à la fin. Bravo Le Guide BJ.', imageUrl: 'https://picsum.photos/seed/adrien/100/100', rating: 5, status: 'approved' },
    { id: 't7', author: 'Juliette Girard', reviewText: 'J\'ai découvert une culture riche et des gens accueillants. Je reviendrai.', imageUrl: 'https://picsum.photos/seed/juliette/100/100', rating: 5, status: 'approved' },
    { id: 't8', author: 'Paul Martin', reviewText: 'Le guide était une vraie encyclopédie vivante. Passionnant.', imageUrl: 'https://picsum.photos/seed/paul/100/100', rating: 5, status: 'approved' },
    { id: 't9', author: 'Chloé Garcia', reviewText: 'Une aventure mémorable. Les paysages sont à couper le souffle.', imageUrl: 'https://picsum.photos/seed/chloe/100/100', rating: 4, status: 'approved' },
    { id: 't10', author: 'Thomas Robert', reviewText: 'Le circuit était bien équilibré entre culture, nature et détente.', imageUrl: 'https://picsum.photos/seed/thomas/100/100', rating: 5, status: 'approved' },
    { id: 't11', author: 'Léa Simon', reviewText: 'Un voyage qui change la perspective. Le Bénin est un trésor.', imageUrl: 'https://picsum.photos/seed/lea/100/100', rating: 5, status: 'approved' },
    { id: 't12', author: 'Hugo Lefevre', reviewText: 'Superbe expérience. Le parc Pendjari est un must pour les amoureux de la nature.', imageUrl: 'https://picsum.photos/seed/hugo/100/100', rating: 5, status: 'approved' },
    { id: 't13', author: 'Manon Lopez', reviewText: 'Ganvié est magique. On se sent hors du temps.', imageUrl: 'https://picsum.photos/seed/manon/100/100', rating: 4, status: 'approved' },
];
const initialBlogPosts: BlogPost[] = [
    { id: 'bp1', title: 'Les secrets de la porte du non-retour', content: 'Un récit poignant sur l\'histoire de l\'esclavage à Ouidah. Nous explorons la route des esclaves, un chemin chargé d\'émotion et de mémoire, jusqu\'à la majestueuse Porte du Non-Retour face à l\'océan. C\'est un pèlerinage essentiel pour comprendre une partie sombre mais cruciale de l\'histoire mondiale et béninoise.', imageUrl: 'https://picsum.photos/seed/blog-ouidah/800/400', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'published' },
    { id: 'bp2', title: 'Cuisine béninoise : 5 plats à goûter absolument', content: 'La gastronomie béninoise est riche et savoureuse. De l\'igname pilée (fufu) à la sauce arachide, en passant par le poisson braisé fraîchement pêché à Cotonou, chaque plat est une découverte. Ne manquez pas de goûter le "pâté" local, une pâte de maïs fermentée, accompagnée de sauces relevées. Un régal pour les papilles !', imageUrl: 'https://picsum.photos/seed/blog-food/800/400', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'published' },
    { id: 'bp3', title: 'Mon prochain article', content: 'Contenu à venir...', imageUrl: 'https://picsum.photos/seed/blog-draft/800/400', createdAt: new Date().toISOString(), status: 'draft' },
];
const initialExperiences: Experience[] = [
    { id: 'exp1', title: 'Ouidah, Mémoire et Héritage', description: 'Suivez la Route des Esclaves et découvrez l\'histoire poignante de la traite transatlantique à travers ses monuments emblématiques.', imageUrl: 'https://picsum.photos/seed/dest-ouidah/600/400', status: 'published'},
    { id: 'exp2', title: 'Le Berceau du Vaudou', description: 'Explorez les origines et les rituels d\'une spiritualité authentique, bien loin des clichés, et rencontrez ses dignitaires.', imageUrl: 'https://picsum.photos/seed/dest-vodoun/600/400', status: 'published' },
    { id: 'exp3', title: 'Les Châteaux des Tatas Somba', description: 'Admirez l\'architecture unique des \"châteaux forts\" en terre du peuple Somba, un témoignage d\'ingéniosité et de tradition.', imageUrl: 'https://picsum.photos/seed/dest-tata-somba/600/400', status: 'published'},
    { id: 'exp4', title: 'Cotonou, la vibrante', description: 'Découvrez le plus grand marché d\'Afrique de l\'Ouest, Dantokpa, et l\'artisanat local.', imageUrl: 'https://picsum.photos/seed/dest-cotonou/600/400', status: 'draft'},
];
const initialHomePageContent: HomePageContent = {
  hero: {
    title: "Tourisme Durable au Cœur du Bénin",
    subtitle: "Explorez une nature préservée et soutenez les communautés locales.",
    imageUrl: "https://picsum.photos/seed/benin-nature/1600/900",
  },
  engagement: {
    title: "Notre Engagement Écologique",
    subtitle: "Nous créons des expériences authentiques et mémorables, en vous connectant à la culture, à l'histoire et à la beauté naturelle du Bénin, de manière responsable.",
    imageUrl: "https://picsum.photos/seed/engagement/800/600",
    items: [
      { icon: 'leaf', title: "Expériences Immersives", description: "Vivez au plus près de la nature et des traditions locales, loin du tourisme de masse." },
      { icon: 'users', title: "Soutien Communautaire", description: "Votre voyage contribue directement à l'économie locale et au bien-être des populations." },
      { icon: 'globe', title: "Impact Positif Garanti", description: "Nous nous engageons à minimiser notre empreinte écologique et à protéger la biodiversité." },
    ]
  },
  faq: {
    title: "Questions Fréquemment Posées",
    subtitle: "Trouvez les réponses à vos questions les plus courantes sur nos voyages au Bénin.",
    items: [
      {
        question: "Quelle est la meilleure période pour visiter le Bénin ?",
        answer: "La meilleure période pour visiter le Bénin est la saison sèche, qui s'étend de novembre à avril. Les températures sont agréables et les pluies sont rares, ce qui est idéal pour les safaris et les visites culturelles."
      },
      {
        question: "Faut-il un visa pour se rendre au Bénin ?",
        answer: "Oui, un visa est nécessaire pour la plupart des nationalités. Nous vous recommandons de vérifier les exigences spécifiques auprès de l'ambassade du Bénin dans votre pays. Un visa électronique (e-visa) est souvent disponible."
      },
      {
        question: "Quels vaccins sont recommandés ?",
        answer: "Le vaccin contre la fièvre jaune est obligatoire. D'autres vaccins comme l'hépatite A, la typhoïde et un traitement antipaludique sont fortement recommandés. Consultez votre médecin pour des conseils personnalisés."
      }
    ]
  }
};

const exchangeRates: { [key: string]: number } = {
    EUR: 1,
    USD: 1.08,
    XOF: 655.957,
};

// --- UTILITY FUNCTIONS ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key “${key}”:`, error);
  }
};

// --- CONTEXT & PROVIDER ---
interface AppContextType {
  tours: Tour[];
  bookings: Booking[];
  messages: Message[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  experiences: Experience[];
  homePageContent: HomePageContent;
  viewedTours: string[];
  wishlist: string[];
  isAuthenticated: boolean;
  currency: string;
  exchangeRates: { [key: string]: number };
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrency: (currency: string) => void;
  addTour: (tour: Omit<Tour, 'id'>) => void;
  updateTour: (tour: Tour) => void;
  deleteTour: (tourId: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'tourTitle'>) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  addMessage: (message: Omit<Message, 'id'| 'date' | 'read'>) => void;
  markMessageAsRead: (messageId: string) => void;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'status'>) => void;
  updateTestimonialStatus: (testimonialId: string, status: Testimonial['status']) => void;
  trackViewedTour: (tourId: string) => void;
  toggleWishlist: (tourId: string) => void;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt'>) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (postId: string) => void;
  addExperience: (exp: Omit<Experience, 'id'>) => void;
  updateExperience: (exp: Experience) => void;
  deleteExperience: (expId: string) => void;
  updateHomePageContent: (content: HomePageContent) => void;
  login: (password: string) => boolean;
  logout: () => void;
  isBookingModalOpen: boolean;
  bookingModalTourId: string | null;
  openBookingModal: (tourId: string | null) => void;
  closeBookingModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppStoreProvider = ({ children }: PropsWithChildren<{}>) => {
  const [tours, setTours] = useState<Tour[]>(() => getFromStorage('tours_data', initialTours));
  const [bookings, setBookings] = useState<Booking[]>(() => getFromStorage('bookings_data', initialBookings));
  const [messages, setMessages] = useState<Message[]>(() => getFromStorage('messages_data', initialMessages));
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => getFromStorage('testimonials_data', initialTestimonials));
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => getFromStorage('blogposts_data', initialBlogPosts));
  const [experiences, setExperiences] = useState<Experience[]>(() => getFromStorage('experiences_data', initialExperiences));
  const [homePageContent, setHomePageContent] = useState<HomePageContent>(() => getFromStorage('homepage_content', initialHomePageContent));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getFromStorage('auth_status', false));
  const [viewedTours, setViewedTours] = useState<string[]>(() => getFromStorage('viewed_tours', []));
  const [wishlist, setWishlist] = useState<string[]>(() => getFromStorage('user_wishlist', []));
  const [currency, setCurrencyState] = useState<string>(() => getFromStorage('user_currency', 'EUR'));
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => getFromStorage('app_theme', 'light'));
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalTourId, setBookingModalTourId] = useState<string | null>(null);

  useEffect(() => saveToStorage('tours_data', tours), [tours]);
  useEffect(() => saveToStorage('bookings_data', bookings), [bookings]);
  useEffect(() => saveToStorage('messages_data', messages), [messages]);
  useEffect(() => saveToStorage('testimonials_data', testimonials), [testimonials]);
  useEffect(() => saveToStorage('blogposts_data', blogPosts), [blogPosts]);
  useEffect(() => saveToStorage('experiences_data', experiences), [experiences]);
  useEffect(() => saveToStorage('homepage_content', homePageContent), [homePageContent]);
  useEffect(() => saveToStorage('auth_status', isAuthenticated), [isAuthenticated]);
  useEffect(() => saveToStorage('viewed_tours', viewedTours), [viewedTours]);
  useEffect(() => saveToStorage('user_wishlist', wishlist), [wishlist]);
  useEffect(() => saveToStorage('user_currency', currency), [currency]);
  useEffect(() => saveToStorage('app_theme', theme), [theme]);
  
  const setTheme = useCallback((newTheme: 'light' | 'dark') => setThemeState(newTheme), []);
  const setCurrency = useCallback((newCurrency: string) => setCurrencyState(newCurrency), []);

  const addTour = useCallback((tour: Omit<Tour, 'id'>) => {
    setTours(prev => [...prev, { ...tour, id: `tour_${Date.now()}` }]);
  }, []);
  
  const updateTour = useCallback((updatedTour: Tour) => {
    setTours(prev => prev.map(tour => tour.id === updatedTour.id ? updatedTour : tour));
  }, []);
  
  const deleteTour = useCallback((tourId: string) => {
    setTours(prev => prev.filter(tour => tour.id !== tourId));
  }, []);

  const addBooking = useCallback((booking: Omit<Booking, 'id' | 'bookingDate' | 'status' | 'tourTitle'>) => {
    setBookings(prev => {
        const tourTitle = tours.find(t => t.id === booking.tourId)?.title || 'Circuit inconnu';
        const newBooking: Booking = {
          ...booking,
          id: `booking_${Date.now()}`,
          bookingDate: new Date().toISOString(),
          status: 'En attente',
          tourTitle,
        };
        return [newBooking, ...prev];
    });
  }, [tours]);
  
  const updateBookingStatus = useCallback((bookingId: string, status: Booking['status']) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  }, []);

  const addMessage = useCallback((message: Omit<Message, 'id'| 'date' | 'read'>) => {
      const newMessage: Message = {
          ...message,
          id: `msg_${Date.now()}`,
          date: new Date().toISOString(),
          read: false,
      };
      setMessages(prev => [newMessage, ...prev]);
  }, []);

  const markMessageAsRead = useCallback((messageId: string) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  }, []);

  const addTestimonial = useCallback((testimonial: Omit<Testimonial, 'id' | 'status'>) => {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: `testimonial_${Date.now()}`,
      status: 'pending',
    };
    setTestimonials(prev => [newTestimonial, ...prev]);
  }, []);

  const updateTestimonialStatus = useCallback((testimonialId: string, status: Testimonial['status']) => {
    setTestimonials(prev => prev.map(t => t.id === testimonialId ? { ...t, status } : t));
  }, []);

  const trackViewedTour = useCallback((tourId: string) => {
    setViewedTours(prev => {
        const set = new Set(prev);
        set.add(tourId);
        return Array.from(set);
    });
  }, []);
  
  const toggleWishlist = useCallback((tourId: string) => {
    setWishlist(prev => {
      const set = new Set(prev);
      if (set.has(tourId)) {
        set.delete(tourId);
      } else {
        set.add(tourId);
      }
      return Array.from(set);
    });
  }, []);

  const addBlogPost = useCallback((post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    setBlogPosts(prev => [{ ...post, id: `bp_${Date.now()}`, createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const updateBlogPost = useCallback((updatedPost: BlogPost) => {
    setBlogPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
  }, []);

  const deleteBlogPost = useCallback((postId: string) => {
    setBlogPosts(prev => prev.filter(post => post.id !== postId));
  }, []);

  const addExperience = useCallback((exp: Omit<Experience, 'id'>) => {
    setExperiences(prev => [{ ...exp, id: `exp_${Date.now()}` }, ...prev]);
  }, []);

  const updateExperience = useCallback((updatedExp: Experience) => {
    setExperiences(prev => prev.map(exp => exp.id === updatedExp.id ? updatedExp : exp));
  }, []);

  const deleteExperience = useCallback((expId: string) => {
    setExperiences(prev => prev.filter(exp => exp.id !== expId));
  }, []);

  const updateHomePageContent = useCallback((content: HomePageContent) => {
    setHomePageContent(content);
  }, []);

  const login = useCallback((password: string) => {
    if (password === 'Ado@25') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);
  
  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);
  
  const openBookingModal = useCallback((tourId: string | null) => {
    setBookingModalTourId(tourId);
    setIsBookingModalOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
    setBookingModalTourId(null);
  }, []);
  
  const value = useMemo(() => ({
    tours,
    bookings,
    messages,
    testimonials,
    blogPosts,
    experiences,
    homePageContent,
    viewedTours,
    wishlist,
    isAuthenticated,
    currency,
    exchangeRates,
    theme,
    setTheme,
    setCurrency,
    addTour,
    updateTour,
    deleteTour,
    addBooking,
    updateBookingStatus,
    addMessage,
    markMessageAsRead,
    addTestimonial,
    updateTestimonialStatus,
    trackViewedTour,
    toggleWishlist,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    addExperience,
    updateExperience,
    deleteExperience,
    updateHomePageContent,
    login,
    logout,
    isBookingModalOpen,
    bookingModalTourId,
    openBookingModal,
    closeBookingModal,
  }), [
      tours, bookings, messages, testimonials, blogPosts, experiences, homePageContent,
      viewedTours, wishlist, isAuthenticated, currency, theme, isBookingModalOpen,
      bookingModalTourId, addBooking, setTheme, setCurrency, addTour, updateTour,
      deleteTour, updateBookingStatus, addMessage, markMessageAsRead, addTestimonial,
      updateTestimonialStatus, trackViewedTour, toggleWishlist, addBlogPost,
      updateBlogPost, deleteBlogPost, addExperience, updateExperience, deleteExperience,
      updateHomePageContent, login, logout, openBookingModal, closeBookingModal
  ]);

  return React.createElement(AppContext.Provider, { value: value }, children);
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};
