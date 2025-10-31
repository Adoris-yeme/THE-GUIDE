import React from 'react';
import type { Tour, Testimonial, BlogPost, Experience } from '../types';
import { Link } from 'react-router-dom';
import { useAppStore } from '../hooks/useAppStore';
import { useI18n } from '../i18n';

// --- Icons ---
export const LeafIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 15.536c-1.171 1.952-3.07 1.952-4.242 0-1.172-1.953-1.172-5.119 0-7.072 1.171-1.952 3.07-1.952 4.242 0 1.172 1.953 1.172 5.119 0 7.072z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-4m0-12V4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 4.929L7.05 7.05m9.9 9.9l2.121 2.121" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.929 19.071L7.05 16.95m9.9-9.9l2.121-2.121" />
    </svg>
);
export const UsersIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);
export const GlobeAltIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 9a9 9 0 01-9 9" />
    </svg>
);


const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
    <svg className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export const StarRatingDisplay = ({ rating }: { rating: number }) => (
    <div className="flex">
        {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < rating} />)}
    </div>
);


// --- UI Components ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = "px-6 py-3 rounded-md font-semibold transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary',
    secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 focus:ring-brand-secondary',
    accent: 'bg-brand-accent hover:bg-brand-accent/90 text-brand-dark focus:ring-brand-accent',
  };
  return <button className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`} {...props}>{children}</button>;
};

export const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={`bg-white dark:bg-brand-dark rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-200/50 dark:border-brand-dark/50 ${className || ''}`}>
    {children}
  </div>
);


// --- Form Elements ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-brand-dark dark:text-brand-light/70">{label}</label>
    <input
      id={id}
      ref={ref}
      className="mt-1 block w-full px-3 py-2 bg-white dark:bg-brand-dark/50 text-brand-dark dark:text-brand-light border border-gray-300 dark:border-brand-secondary rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
      {...props}
    />
  </div>
));

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, id, ...props }, ref) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-dark dark:text-brand-light/70">{label}</label>
      <textarea
        id={id}
        ref={ref}
        rows={4}
        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-brand-dark/50 text-brand-dark dark:text-brand-light border border-gray-300 dark:border-brand-secondary rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
        {...props}
      />
    </div>
));


// --- App-specific Components ---
interface TourCardProps {
  tour: Tour;
}
export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const { trackViewedTour, currency, exchangeRates, wishlist, toggleWishlist } = useAppStore();
  const { t } = useI18n();

  const convertedPrice = tour.price * (exchangeRates[currency] || 1);
  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'XOF' ? 0 : 2,
  }).format(convertedPrice);

  const isInWishlist = wishlist.includes(tour.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(tour.id);
  };

  return (
    <Card className="flex flex-col bg-brand-light dark:bg-brand-dark">
      <div className="relative">
        <img src={tour.imageUrl} alt={tour.title} className="w-full h-64 object-cover" />
        <button
            onClick={handleWishlistClick}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/70 dark:bg-brand-dark/70 hover:bg-white dark:hover:bg-brand-secondary/50 text-brand-secondary transition-colors"
            aria-label={t('ui.tourCard.addToWishlist')}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
        </button>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-brand-dark dark:text-brand-light">{tour.title}</h3>
        <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow line-clamp-3">{tour.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-brand-primary dark:text-green-400">{formattedPrice}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{tour.duration}</span>
        </div>
         <Link to={`/circuits/${tour.id}`} className="mt-4 w-full" onClick={() => trackViewedTour(tour.id)}>
          <Button variant="secondary" className="w-full">{t('ui.tourCard.details')}</Button>
        </Link>
      </div>
    </Card>
  );
};

interface TestimonialCardProps {
  testimonial: Testimonial;
}
export const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => (
  <Card className="p-6 bg-brand-light dark:bg-brand-dark">
    <div className="flex items-start space-x-4">
      <img className="w-16 h-16 rounded-full object-cover" src={testimonial.imageUrl} alt={testimonial.author} />
      <div>
        <div className="flex justify-between items-center">
            <p className="font-bold text-brand-primary dark:text-green-400">{testimonial.author}</p>
            <StarRatingDisplay rating={testimonial.rating} />
        </div>
        <p className="mt-2 text-gray-700 dark:text-gray-300 italic">"{testimonial.reviewText}"</p>
      </div>
    </div>
  </Card>
);

export const BlogPostCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    const { t } = useI18n();
    return (
        <Card className="flex flex-col bg-brand-light dark:bg-brand-dark">
            <img src={post.imageUrl} alt={post.title} className="w-full h-48 object-cover" />
            <div className="p-6 flex flex-col flex-grow">
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                <h3 className="mt-1 text-xl font-bold text-brand-dark dark:text-brand-light">{post.title}</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow line-clamp-3">{post.content}</p>
                <Link to={`/blog/${post.id}`} className="mt-4 self-start">
                    <span className="font-semibold text-brand-primary dark:text-green-400 hover:text-brand-primary/80 dark:hover:text-green-300">{t('ui.blogPostCard.readMore')} &rarr;</span>
                </Link>
            </div>
        </Card>
    );
}

export const ExperienceCard: React.FC<{ experience: Experience }> = ({ experience }) => {
    const { t } = useI18n();
    return (
        <Card className="text-left flex flex-col">
            <img src={experience.imageUrl} alt={experience.title} className="w-full h-64 object-cover"/>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-brand-primary dark:text-green-400">{experience.title}</h3>
                <p className="mt-2 text-gray-700 dark:text-gray-400 flex-grow">{experience.description}</p>
                 <Link to="/circuits" className="mt-4 self-start">
                  <span className="font-semibold text-brand-secondary dark:text-orange-400 hover:text-brand-secondary/80 dark:hover:text-orange-300">{t('home.viewTours')} &rarr;</span>
                </Link>
            </div>
        </Card>
    );
};