import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { useI18n } from '../i18n';
import { Button, Card, Input, Textarea, TestimonialCard, TourCard, BlogPostCard, LeafIcon, UsersIcon, GlobeAltIcon, ExperienceCard } from '../components/ui';

// --- Helper: Animation Hook ---
const useAnimateOnScroll = (): [React.RefObject<HTMLDivElement>, boolean] => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return [ref, isVisible];
};

// --- Recommended Tours Component ---
const RecommendedTours = () => {
    const { tours, viewedTours } = useAppStore();
    const { t } = useI18n();
    const publishedTours = useMemo(() => tours.filter(t => t.status === 'published'), [tours]);

    const recommended = useMemo(() => {
        if (viewedTours.length === 0) {
            return publishedTours.slice(0, 3);
        }
        const viewedIds = new Set(viewedTours);
        const notViewed = publishedTours.filter(t => !viewedIds.has(t.id));
        return notViewed.length > 0 ? notViewed.slice(0, 3) : publishedTours.slice(0, 3);
    }, [publishedTours, viewedTours]);
    
    if (recommended.length === 0) return null;

    return (
        <section id="circuits-recommandes" className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-brand-dark dark:text-white">
                    {viewedTours.length > 0 ? t('home.recommendedForYou') : t('home.recommendedPopular')}
                </h2>
                <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {recommended.map(tour => <TourCard key={tour.id} tour={tour} />)}
                </div>
            </div>
        </section>
    );
};


// --- Helper: FAQ Item Component ---
const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-brand-secondary/50 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-brand-dark dark:text-white focus:outline-none"
      >
        <span className="text-left">{question}</span>
        <svg
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 mt-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600 dark:text-gray-400">
          {answer}
        </p>
      </div>
    </div>
  );
};


// --- Page: Accueil ---
const iconMap = {
    leaf: LeafIcon,
    users: UsersIcon,
    globe: GlobeAltIcon,
};

export const Home = () => {
  const { homePageContent, experiences } = useAppStore();
  const { t } = useI18n();
  const { hero, engagement } = homePageContent;
  
  const [recommendedRef, recommendedIsVisible] = useAnimateOnScroll();
  const [engagementRef, engagementIsVisible] = useAnimateOnScroll();
  const [faqRef, faqIsVisible] = useAnimateOnScroll();
  const [destinationsRef, destinationsIsVisible] = useAnimateOnScroll();
  const [experiencesRef, experiencesIsVisible] = useAnimateOnScroll();
  
  const publishedExperiences = useMemo(() => experiences.filter(e => e.status === 'published'), [experiences]);

  return (
    <div className="bg-brand-light dark:bg-brand-dark">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] text-white overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center kenburns-top" style={{ backgroundImage: `url('${hero.imageUrl}')` }}></div>
        <div className="absolute inset-0 bg-brand-primary bg-opacity-60 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">{hero.title}</h1>
            <p className="mt-4 text-xl md:text-2xl max-w-2xl">{hero.subtitle}</p>
            <Button variant="accent" className="mt-8" onClick={() => document.getElementById('circuits-recommandes')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('home.discoverButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* Recommended Tours Section */}
      <div ref={recommendedRef} className={recommendedIsVisible ? 'fade-in-up-visible' : 'fade-in-up-hidden'}>
        <RecommendedTours />
      </div>

      {/* Engagement Section */}
      <div ref={engagementRef} className={engagementIsVisible ? 'fade-in-up-visible' : 'fade-in-up-hidden'}>
        <section id="engagement" className="bg-brand-light dark:bg-brand-dark py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                   <img src={engagement.imageUrl} alt={engagement.title} className="rounded-lg shadow-xl" />
              </div>
              <div className="text-left">
                  <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{engagement.title}</h2>
                  <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">{engagement.subtitle}</p>
                  <div className="mt-8 space-y-6">
                       {engagement.items.map((item, index) => {
                          const IconComponent = iconMap[item.icon];
                          return (
                              <div key={index} className="flex items-start gap-4">
                                  <div className="flex-shrink-0 p-3 bg-white dark:bg-brand-dark/50 rounded-full shadow-sm">
                                      <IconComponent className="h-8 w-8 text-brand-primary dark:text-green-400" />
                                  </div>
                                  <div>
                                      <h3 className="text-xl font-semibold text-brand-dark dark:text-white">{item.title}</h3>
                                      <p className="mt-1 text-gray-600 dark:text-gray-400">{item.description}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
        </section>
      </div>

      {/* FAQ Section */}
      {homePageContent.faq && homePageContent.faq.items && (
        <div ref={faqRef} className={faqIsVisible ? 'fade-in-up-visible' : 'fade-in-up-hidden'}>
          <section className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{homePageContent.faq.title}</h2>
              <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">{homePageContent.faq.subtitle}</p>
              <div className="mt-12 max-w-3xl mx-auto text-left">
                {homePageContent.faq.items.map((item, index) => (
                  <FaqItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
      
      {/* Destinations Section */}
      <div ref={destinationsRef} className={destinationsIsVisible ? 'fade-in-up-visible' : 'fade-in-up-hidden'}>
        <section className="bg-brand-light dark:bg-brand-dark py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{t('home.destinationsTitle')}</h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">{t('home.destinationsSubtitle')}</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {/* Destination Card 1 */}
              <Card className="text-left flex flex-col">
                <img src="https://picsum.photos/seed/dest-ganvie/600/400" alt="Ganvié" className="w-full h-64 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-brand-primary dark:text-green-400">{t('home.destGanvieTitle')}</h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow">{t('home.destGanvieText')}</p>
                  <Link to="/circuits" className="mt-4 self-start">
                    <span className="font-semibold text-brand-secondary dark:text-orange-400 hover:text-brand-secondary/80 dark:hover:text-orange-300">{t('home.viewTours')} &rarr;</span>
                  </Link>
                </div>
              </Card>
              {/* Destination Card 2 */}
              <Card className="text-left flex flex-col">
                <img src="https://picsum.photos/seed/dest-abomey/600/400" alt="Palais d'Abomey" className="w-full h-64 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-brand-primary dark:text-green-400">{t('home.destAbomeyTitle')}</h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow">{t('home.destAbomeyText')}</p>
                  <Link to="/circuits" className="mt-4 self-start">
                    <span className="font-semibold text-brand-secondary dark:text-orange-400 hover:text-brand-secondary/80 dark:hover:text-orange-300">{t('home.viewTours')} &rarr;</span>
                  </Link>
                </div>
              </Card>
              {/* Destination Card 3 */}
              <Card className="text-left flex flex-col">
                <img src="https://picsum.photos/seed/dest-pendjari/600/400" alt="Parc National de la Pendjari" className="w-full h-64 object-cover"/>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-brand-primary dark:text-green-400">{t('home.destPendjariTitle')}</h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow">{t('home.destPendjariText')}</p>
                  <Link to="/circuits" className="mt-4 self-start">
                    <span className="font-semibold text-brand-secondary dark:text-orange-400 hover:text-brand-secondary/80 dark:hover:text-orange-300">{t('home.viewTours')} &rarr;</span>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
      
      {/* Unique Experiences Section */}
      <div ref={experiencesRef} className={experiencesIsVisible ? 'fade-in-up-visible' : 'fade-in-up-hidden'}>
        <section className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-screen-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-brand-dark dark:text-white">{t('home.experiencesTitle')}</h2>
            <p className="mt-4 text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">{t('home.experiencesSubtitle')}</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {publishedExperiences.map(exp => <ExperienceCard key={exp.id} experience={exp} />)}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Page: Nos Circuits ---
export const Tours = () => {
    const { tours, currency, setCurrency } = useAppStore();
    const { t } = useI18n();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('all');
    const [priceRange, setPriceRange] = useState(2000);
    const [tagFilter, setTagFilter] = useState('all');

    const publishedTours = useMemo(() => tours.filter(t => t.status === 'published'), [tours]);
    const categories = useMemo(() => ['all', ...Array.from(new Set(publishedTours.map(t => t.category)))], [publishedTours]);
    const allTags = useMemo(() => ['all', ...Array.from(new Set(publishedTours.flatMap(t => t.tags || [])))], [publishedTours]);

    const filteredTours = useMemo(() => {
        const getDurationInDays = (durationStr: string) => parseInt(durationStr.split(' ')[0], 10);
        return publishedTours.filter(tour => {
            const searchMatch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                tour.description.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === 'all' || tour.category === categoryFilter;
            const priceMatch = tour.price <= priceRange;
            const tagMatch = tagFilter === 'all' || (tour.tags && tour.tags.includes(tagFilter));

            const durationInDays = getDurationInDays(tour.duration);
            const durationMatch = durationFilter === 'all' ||
                (durationFilter === 'short' && durationInDays <= 3) ||
                (durationFilter === 'medium' && durationInDays > 3 && durationInDays <= 7) ||
                (durationFilter === 'long' && durationInDays > 7);

            return searchMatch && categoryMatch && priceMatch && durationMatch && tagMatch;
        });
    }, [searchTerm, categoryFilter, durationFilter, priceRange, tagFilter, publishedTours]);

    return (
        <div className="bg-brand-light dark:bg-brand-dark min-h-screen">
            <div className="max-w-screen-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-dark dark:text-white">{t('tours.title')}</h1>
                    <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{t('tours.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left side: Filters & Tours */}
                    <div className="lg:col-span-3">
                        {/* Filters */}
                        <div className="mb-8 p-4 bg-white dark:bg-brand-dark/50 rounded-lg shadow">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="lg:col-span-2">
                                    <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tours.searchLabel')}</label>
                                    <input
                                        type="text" id="search-term" placeholder={t('tours.searchPlaceholder')}
                                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 rounded-md border-gray-300 dark:border-brand-secondary dark:bg-brand-dark dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary"
                                    />
                                </div>
                                {/* Category */}
                                <div>
                                    <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tours.categoryLabel')}</label>
                                    <select id="category-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 rounded-md border-gray-300 dark:border-brand-secondary dark:bg-brand-dark dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary">
                                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? t('tours.allCategories') : cat}</option>)}
                                    </select>
                                </div>
                                {/* Duration */}
                                <div>
                                     <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tours.durationLabel')}</label>
                                     <select id="duration-select" value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 rounded-md border-gray-300 dark:border-brand-secondary dark:bg-brand-dark dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary">
                                        <option value="all">{t('tours.allDurations')}</option>
                                        <option value="short">{t('tours.durationShort')}</option>
                                        <option value="medium">{t('tours.durationMedium')}</option>
                                        <option value="long">{t('tours.durationLong')}</option>
                                    </select>
                                </div>
                                {/* Currency */}
                                <div>
                                    <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tours.currencyLabel')}</label>
                                    <select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)}
                                        className="mt-1 w-full px-3 py-2 rounded-md border-gray-300 dark:border-brand-secondary dark:bg-brand-dark dark:text-white shadow-sm focus:border-brand-primary focus:ring-brand-primary">
                                        <option value="EUR">€ EUR</option>
                                        <option value="USD">$ USD</option>
                                        <option value="XOF">F CFA</option>
                                    </select>
                                </div>
                                 {/* Price */}
                                 <div className="lg:col-span-4">
                                    <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('tours.priceLabel', {price: priceRange})}</label>
                                    <input
                                        type="range" id="price-range" min="300" max="2000" step="50"
                                        value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
                                        className="mt-1 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tours List */}
                        {filteredTours.length > 0 ? (
                            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <h2 className="text-2xl font-semibold text-brand-dark dark:text-white">{t('tours.noResultsTitle')}</h2>
                                <p className="mt-2 text-gray-700 dark:text-gray-400">{t('tours.noResultsSubtitle')}</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Right side: Tags */}
                    <aside className="lg:col-span-1">
                         {allTags.length > 1 && (
                            <div className="sticky top-24 p-4 bg-white dark:bg-brand-dark/50 rounded-lg shadow">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setTagFilter(tag)}
                                            className={`px-3 py-1 text-sm rounded-full transition-colors ${tagFilter === tag ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-brand-dark text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-brand-secondary/50'}`}
                                        >
                                            {tag === 'all' ? t('tours.allTags') : tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

// --- Page: Détail d'un circuit ---
export const TourDetail = () => {
    const { tourId } = useParams();
    const { tours, trackViewedTour, openBookingModal } = useAppStore();
    const { t } = useI18n();
    const tour = useMemo(() => tours.find(t => t.id === tourId), [tours, tourId]);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    useEffect(() => {
        if (tourId) trackViewedTour(tourId);
    }, [tourId, trackViewedTour]);

    if (!tour) {
        return (
            <div className="text-center py-20 dark:text-white">
                <h1 className="text-2xl">{t('tourDetail.notFound')}</h1>
                <Link to="/circuits" className="text-brand-primary dark:text-green-400 hover:underline mt-4 inline-block">{t('tourDetail.backToTours')}</Link>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-brand-dark relative">
            {/* Header Section */}
            <section className="relative h-[50vh] bg-cover bg-center text-white" style={{ backgroundImage: `url('${tour.imageUrl}')` }}>
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-center p-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{tour.title}</h1>
                    <p className="mt-4 text-xl">{tour.duration} | {tour.category}</p>
                </div>
            </section>
            
            <div className="max-w-screen-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                 <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark dark:text-white">{t('tourDetail.description')}</h2>
                            <p className="mt-4 text-gray-700 dark:text-gray-300 text-lg">{tour.description}</p>
                        </div>

                        {/* Itinerary */}
                        <div>
                            <h2 className="text-2xl font-bold text-brand-dark dark:text-white">{t('tourDetail.itinerary')}</h2>
                            <div className="mt-4 space-y-6 border-l-2 border-brand-primary dark:border-green-500 pl-6">
                                {tour.itinerary.map(item => (
                                    <div key={item.day} className="relative">
                                        <div className="absolute -left-[34px] top-1 h-4 w-4 rounded-full bg-brand-primary dark:bg-green-500 border-4 border-white dark:border-brand-dark"></div>
                                        <h3 className="text-xl font-semibold text-brand-primary dark:text-green-400">{t('tourDetail.day', {day: item.day})}: {item.title}</h3>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Gallery */}
                        {tour.gallery.length > 0 && (
                             <div>
                                <h2 className="text-2xl font-bold text-brand-dark dark:text-white">{t('tourDetail.gallery')}</h2>
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {tour.gallery.map((img, index) => (
                                        <button key={index} onClick={() => setLightboxImage(img)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-dark focus:ring-brand-primary rounded-lg overflow-hidden">
                                            <img src={img} alt={`Galerie ${index+1}`} className="rounded-lg shadow-md object-cover aspect-video w-full h-full cursor-pointer transition-transform hover:scale-105" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="mt-12 lg:mt-0">
                         <div className="sticky top-24 space-y-6">
                            <Card className="p-6">
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white">{t('tourDetail.included')}</h3>
                                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-400">
                                    {tour.included.map((item, i) => <li key={i} className="flex items-start"><span className="text-green-500 mr-2 mt-1">✔</span> {item}</li>)}
                                </ul>
                            </Card>
                             <Card className="p-6">
                                <h3 className="text-xl font-bold text-brand-dark dark:text-white">{t('tourDetail.excluded')}</h3>
                                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-400">
                                    {tour.excluded.map((item, i) => <li key={i} className="flex items-start"><span className="text-red-500 mr-2 mt-1">✖</span> {item}</li>)}
                                </ul>
                            </Card>
                            <Button variant="accent" className="w-full text-lg" onClick={() => openBookingModal(tour.id)}>{t('tourDetail.bookButton')}</Button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[999]"
                    onClick={() => setLightboxImage(null)}
                >
                    <img 
                        src={lightboxImage} 
                        alt="Vue agrandie" 
                        className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image
                    />
                    <button 
                        onClick={() => setLightboxImage(null)}
                        className="absolute top-4 right-4 text-white text-5xl font-light hover:text-gray-300"
                    >&times;</button>
                </div>
            )}
        </div>
    );
};


// --- Page: À Propos ---
export const About = () => {
    const { t } = useI18n();
    return (
      <div className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-brand-dark dark:text-white mb-8">{t('about.title')}</h1>
          <img src="https://picsum.photos/seed/team-benin/800/400" alt="Équipe Le Guide BJ" className="rounded-lg shadow-lg mb-8" />
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p dangerouslySetInnerHTML={{ __html: t('about.p1') }} />
            <p dangerouslySetInnerHTML={{ __html: t('about.p2') }} />
            <p dangerouslySetInnerHTML={{ __html: t('about.p3') }} />
          </div>
        </div>
      </div>
    );
};

// --- Page: Galerie & Témoignages ---
export const GalleryAndTestimonials = () => {
    const { testimonials, addTestimonial } = useAppStore();
    const { t } = useI18n();
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [rating, setRating] = useState(0);

    const approvedTestimonials = useMemo(() => testimonials.filter(t => t.status === 'approved'), [testimonials]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const pageCount = Math.ceil(approvedTestimonials.length / ITEMS_PER_PAGE);
    const paginatedTestimonials = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return approvedTestimonials.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, approvedTestimonials]);


    const galleryImages = [
        'https://picsum.photos/seed/gallery1/600/400', 'https://picsum.photos/seed/gallery2/600/400',
        'https://picsum.photos/seed/gallery3/600/400', 'https://picsum.photos/seed/gallery4/600/400',
        'https://picsum.photos/seed/gallery5/600/400', 'https://picsum.photos/seed/gallery6/600/400',
    ];

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (rating === 0) {
            alert(t('gallery.pleaseSelectRating'));
            return;
        }
        try {
            addTestimonial({
                author: formData.get('author') as string,
                reviewText: formData.get('reviewText') as string,
                imageUrl: formData.get('imageUrl') as string || `https://picsum.photos/seed/${formData.get('author')}/100/100`,
                rating: rating,
            });
            setSubmissionStatus('success');
            e.currentTarget.reset();
            setRating(0);
        } catch {
            setSubmissionStatus('error');
        }
    };

    return (
        <div className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-brand-dark dark:text-white mb-12">{t('gallery.title')}</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryImages.map((src, index) => (
                        <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                            <img src={src} alt={`Galerie ${index + 1}`} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300" />
                        </div>
                    ))}
                </div>

                <h2 className="text-4xl font-bold text-center text-brand-dark dark:text-white mt-20 mb-12">{t('gallery.testimonialsTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {paginatedTestimonials.map(testimonial => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
                </div>

                {pageCount > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark text-gray-700 dark:text-gray-200 dark:border-brand-secondary hover:bg-gray-50 dark:hover:bg-brand-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('gallery.paginationPrevious')}
                        </button>
                        {[...Array(pageCount).keys()].map(num => (
                            <button
                                key={num + 1}
                                onClick={() => setCurrentPage(num + 1)}
                                className={`px-4 py-2 border rounded-md ${currentPage === num + 1 ? 'bg-brand-primary text-white' : 'bg-white dark:bg-brand-dark text-gray-700 dark:text-gray-200 dark:border-brand-secondary hover:bg-gray-50 dark:hover:bg-brand-secondary/50'}`}
                            >
                                {num + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
                            disabled={currentPage === pageCount}
                            className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark text-gray-700 dark:text-gray-200 dark:border-brand-secondary hover:bg-gray-50 dark:hover:bg-brand-secondary/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('gallery.paginationNext')}
                        </button>
                    </div>
                )}


                <div className="max-w-2xl mx-auto mt-20">
                    <h2 className="text-3xl font-bold text-center text-brand-dark dark:text-white mb-8">{t('gallery.leaveReviewTitle')}</h2>
                     {submissionStatus === 'success' ? (
                          <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4" role="alert">
                            <p className="font-bold">{t('gallery.reviewSuccessTitle')}</p>
                            <p>{t('gallery.reviewSuccessText')}</p>
                          </div>
                     ) : (
                        <Card className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input label={t('gallery.yourName')} id="author" name="author" type="text" required />
                                <Input label={t('gallery.photoUrl')} id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/photo.jpg"/>
                                <div>
                                    <label className="block text-sm font-medium text-brand-dark dark:text-brand-light/70 mb-2">{t('gallery.yourRating')}</label>
                                    <div className="flex space-x-1">
                                        {[...Array(5)].map((_, index) => (
                                            <button type="button" key={index} onClick={() => setRating(index + 1)} className="focus:outline-none">
                                                <svg className={`w-8 h-8 ${index < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Textarea label={t('gallery.yourReview')} id="reviewText" name="reviewText" required />
                                <Button type="submit" variant="primary" className="w-full">{t('gallery.submitReviewButton')}</Button>
                                {submissionStatus === 'error' && <p className="text-red-500 text-sm mt-2">{t('gallery.error')}</p>}
                            </form>
                        </Card>
                     )}
                </div>
            </div>
        </div>
    );
};


// --- Page: Contact ---
export const Contact = () => {
    const { addMessage } = useAppStore();
    const { t } = useI18n();
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        try {
            addMessage({
                name: data.name as string,
                email: data.email as string,
                subject: data.subject as string,
                message: data.message as string,
            });
            setSubmissionStatus('success');
            e.currentTarget.reset();
        } catch {
            setSubmissionStatus('error');
        }
    };

    return (
        <div className="bg-brand-light dark:bg-brand-dark py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-brand-dark dark:text-white mb-12">{t('contact.title')}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <Card className="p-8">
                         {submissionStatus === 'success' ? (
                            <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4" role="alert">
                                <p className="font-bold">{t('contact.successTitle')}</p>
                                <p>{t('contact.successText')}</p>
                            </div>
                        ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-bold text-brand-dark dark:text-white">{t('contact.formTitle')}</h2>
                            <Input label={t('contact.yourName')} id="name" name="name" type="text" required />
                            <Input label={t('contact.yourEmail')} id="email" name="email" type="email" required />
                            <Input label={t('contact.subject')} id="subject" name="subject" type="text" required />
                            <Textarea label={t('contact.yourMessage')} id="message" name="message" required />
                            <Button type="submit" variant="secondary" className="w-full">{t('contact.submitButton')}</Button>
                            {submissionStatus === 'error' && <p className="text-red-500 text-sm mt-2">{t('booking.error')}</p>}
                        </form>
                        )}
                    </Card>
                    <div className="space-y-6 text-brand-dark dark:text-gray-300">
                         <h2 className="text-2xl font-bold dark:text-white">{t('contact.infoTitle')}</h2>
                         <p>{t('contact.infoText')}</p>
                         <p><strong className="mr-2">Email:</strong> leguidebj@gmail.com</p>
                         <p><strong className="mr-2">Téléphone:</strong> +229 52 03 07 44</p>
                         <p><strong className="mr-2">Adresse:</strong> Cotonou, Bénin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Page: Blog List ---
export const BlogList = () => {
    const { blogPosts } = useAppStore();
    const { t } = useI18n();
    const publishedPosts = useMemo(() => blogPosts.filter(p => p.status === 'published'), [blogPosts]);

    return (
        <div className="bg-brand-light dark:bg-brand-dark min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-brand-dark dark:text-white mb-12">{t('blog.title')}</h1>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {publishedPosts.map(post => <BlogPostCard key={post.id} post={post} />)}
                </div>
            </div>
        </div>
    );
};

// --- Page: Blog Post Detail ---
export const BlogPostDetail = () => {
    const { postId } = useParams();
    const { blogPosts } = useAppStore();
    const { t } = useI18n();
    const post = useMemo(() => blogPosts.find(p => p.id === postId), [blogPosts, postId]);

    if (!post) {
        return (
            <div className="text-center py-20 dark:text-white">
                <h1 className="text-2xl">{t('blogDetail.notFound')}</h1>
                <Link to="/blog" className="text-brand-primary dark:text-green-400 hover:underline mt-4 inline-block">{t('blogDetail.backToBlog')}</Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-brand-dark/50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-brand-dark dark:text-white mb-4">{post.title}</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">{t('blogDetail.publishedOn', {date: new Date(post.createdAt).toLocaleDateString()})}</p>
                <img src={post.imageUrl} alt={post.title} className="rounded-lg shadow-lg mb-8 w-full h-auto max-h-[500px] object-cover" />
                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                    {post.content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
                 <div className="text-center mt-12">
                    <Link to="/blog"><Button variant="secondary">{t('blogDetail.backToBlog')}</Button></Link>
                </div>
            </div>
        </div>
    );
};

// --- Page: Wishlist ---
export const Wishlist = () => {
    const { tours, wishlist } = useAppStore();
    const { t } = useI18n();

    const wishlistedTours = useMemo(() => {
        const wishlistSet = new Set(wishlist);
        return tours.filter(tour => wishlistSet.has(tour.id));
    }, [tours, wishlist]);

    return (
        <div className="bg-brand-light dark:bg-brand-dark min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-screen-2xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-brand-dark dark:text-white">{t('wishlist.title')}</h1>
                    <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">{t('wishlist.subtitle')}</p>
                </div>

                {wishlistedTours.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {wishlistedTours.map(tour => <TourCard key={tour.id} tour={tour} />)}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold text-brand-dark dark:text-white">{t('wishlist.emptyTitle')}</h2>
                        <p className="mt-2 text-gray-700 dark:text-gray-400">{t('wishlist.emptySubtitle')}</p>
                        <Link to="/circuits" className="mt-6 inline-block"><Button variant="accent">{t('wishlist.exploreButton')}</Button></Link>
                    </div>
                )}
            </div>
        </div>
    );
};