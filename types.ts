
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string; // e.g., "7 jours"
  imageUrl: string;
  status: 'published' | 'draft';
  // Nouveaux champs pour les pages de détail et les filtres
  category: string; // e.g., "Safari", "Culture", "Histoire"
  itinerary: { day: number; title: string; description: string; }[];
  gallery: string[];
  included: string[];
  excluded: string[];
  tags?: string[];
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfPeople: number;
  bookingDate: string; // ISO string
  status: 'En attente' | 'Confirmée' | 'Annulée';
}

export interface Testimonial {
  id: string;
  author: string;
  reviewText: string;
  rating: number; // 1-5 stars
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Message {
  id:string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string; // ISO string
  read: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string; // ISO String
  status: 'published' | 'draft';
}

export interface Experience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'published' | 'draft';
}

export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
    imageUrl: string;
  };
  engagement: {
    title: string;
    subtitle: string;
    imageUrl: string;
    items: {
      icon: 'leaf' | 'users' | 'globe';
      title: string;
      description: string;
    }[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: {
      question: string;
      answer: string;
    }[];
  };
}