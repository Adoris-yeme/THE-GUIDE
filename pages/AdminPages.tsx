import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Navigate, Outlet, Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Tour, Testimonial, BlogPost, HomePageContent, Experience } from '../types';
import { Button, Input, Textarea, Card, StarRatingDisplay } from '../components/ui';

// --- Image Compression Utility ---
const compressImage = (file: File, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      if (!event.target?.result) return reject(new Error("Couldn't read file"));
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- Route Protégée ---
const AdminRoute = () => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />;
};

// --- Layout Admin ---
const AdminLayout = () => {
  const { logout } = useAppStore();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", label: "Tableau de bord" },
    { to: "/admin/homepage", label: "Gérer l'accueil" },
    { to: "/admin/tours", label: "Gérer les circuits" },
    { to: "/admin/experiences", label: "Gérer les expériences" },
    { to: "/admin/blog", label: "Gérer le blog" },
    { to: "/admin/bookings", label: "Gérer les réservations" },
    { to: "/admin/messages", label: "Gérer les messages" },
    { to: "/admin/testimonials", label: "Gérer les avis" },
  ];

  const getPageTitle = () => {
    const currentLink = navLinks.find(link => location.pathname.startsWith(link.to));
    if (location.pathname.includes('/admin/tours/add')) return "Ajouter un circuit";
    if (location.pathname.includes('/admin/tours/edit')) return "Modifier un circuit";
    return currentLink ? currentLink.label : 'Admin';
  }

  return (
    <div className="flex min-h-screen bg-admin-bg dark:bg-slate-900">
      <aside className="w-64 bg-admin-dark text-white p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-white mb-8">Admin BJ</h1>
        <nav className="flex flex-col space-y-2 flex-grow">
          {navLinks.map(link => (
             <NavLink key={link.to} to={link.to} end={link.to === "/admin/tours"} className={({ isActive }) => `px-4 py-2 rounded-md transition-colors ${isActive ? 'bg-admin-primary' : 'hover:bg-admin-primary/50'}`}>{link.label}</NavLink>
          ))}
        </nav>
        <div className="mt-auto">
            <Link to="/" className="block w-full text-center px-4 py-2 rounded-md hover:bg-admin-secondary">Retour au site</Link>
            <button onClick={logout} className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">Déconnexion</button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-6">{getPageTitle()}</h2>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <Outlet />
        </div>
      </main>
    </div>
  );
};


// --- Page: Login ---
export const Login = () => {
    const { login, isAuthenticated } = useAppStore();
    const [error, setError] = useState('');
    const passwordRef = useRef<HTMLInputElement>(null);

    if (isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const password = passwordRef.current?.value || '';
        if (!login(password)) {
            setError('Mot de passe incorrect.');
        }
        // The state update will trigger a re-render, and the declarative Navigate will handle redirection.
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-light dark:bg-brand-secondary">
            <Card className="w-full max-w-sm p-8">
                <h1 className="text-2xl font-bold text-center text-brand-dark dark:text-white mb-6">Connexion Admin</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input ref={passwordRef} label="Mot de passe" id="password" type="password" required />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full px-6 py-3 rounded-md font-semibold text-white transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 bg-admin-primary hover:bg-admin-primary/90 focus:ring-admin-primary">Se connecter</button>
                </form>
            </Card>
        </div>
    );
};


// --- Chart Component ---
const BarChart = ({ data, title }: { data: { label: string, value: number }[], title: string }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
    return (
        <Card className="p-6 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
            <div className="mt-4 space-y-4">
                {data.map(item => (
                    <div key={item.label} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.label}</span>
                        <div className="col-span-2 bg-gray-200 dark:bg-slate-700 rounded-full h-6">
                            <div
                                className="bg-blue-500 h-6 rounded-full flex items-center justify-end px-2 text-white text-sm"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};


// --- Pages Admin ---
export const AdminDashboard = () => {
    const { tours, bookings, messages, testimonials, blogPosts } = useAppStore();
    const newBookings = bookings.filter(b => b.status === 'En attente').length;
    const unreadMessages = messages.filter(m => !m.read).length;
    const pendingTestimonials = testimonials.filter(t => t.status === 'pending').length;

    const bookingsByTour = useMemo(() => {
        const counts: { [key: string]: number } = {};
        bookings.forEach(booking => {
            counts[booking.tourTitle] = (counts[booking.tourTitle] || 0) + 1;
        });
        return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }, [bookings]);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 text-center bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400">{tours.length}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Circuits</p>
          </Card>
           <Card className="p-6 text-center bg-green-50 dark:bg-green-900/20">
              <h3 className="text-4xl font-bold text-green-600 dark:text-green-400">{blogPosts.length}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Articles de Blog</p>
          </Card>
          <Card className="p-6 text-center bg-yellow-50 dark:bg-yellow-900/20">
              <h3 className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{newBookings}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Nouvelles réservations</p>
          </Card>
          <Card className="p-6 text-center bg-purple-50 dark:bg-purple-900/20">
              <h3 className="text-4xl font-bold text-purple-600 dark:text-purple-400">{pendingTestimonials}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Avis en attente</p>
          </Card>
          <BarChart data={bookingsByTour} title="Réservations par circuit" />
      </div>
  );
};

// Moved initial state outside the component for performance optimization.
const initialTourFormState = {
    title: '', description: '', price: 0, duration: '', imageUrl: '', status: 'draft' as 'draft' | 'published',
    category: '', itinerary: [{ day: 1, title: '', description: '' }], gallery: [] as string[],
    included: [] as string[], excluded: [] as string[], tags: ''
};

export const ManageTourForm = () => {
    const { tourId } = useParams();
    const navigate = useNavigate();
    const { tours, addTour, updateTour } = useAppStore();

    const tour = useMemo(() => tours.find(t => t.id === tourId), [tours, tourId]);
    const isEditing = !!tour;

    const [formData, setFormData] = useState(initialTourFormState);
    
    // Effect to load tour data for editing or reset form for adding
    useEffect(() => {
        if (isEditing && tour) {
            setFormData({ ...tour, tags: tour.tags ? tour.tags.join(', ') : '' });
        } else {
            // Reset form for 'add' mode or if tour not found
            setFormData(initialTourFormState);
        }
    }, [tour, isEditing]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleItineraryChange = (index: number, field: 'title' | 'description', value: string) => {
        const newItinerary = [...formData.itinerary];
        newItinerary[index] = { ...newItinerary[index], day: index + 1, [field]: value };
        setFormData(prev => ({ ...prev, itinerary: newItinerary }));
    };
    
    const addItineraryDay = () => setFormData(prev => ({ ...prev, itinerary: [...prev.itinerary, { day: prev.itinerary.length + 1, title: '', description: '' }]}));
    const removeItineraryDay = (index: number) => setFormData(prev => ({ ...prev, itinerary: prev.itinerary.filter((_, i) => i !== index) }));

    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressedImage = await compressImage(e.target.files[0]);
                setFormData(prev => ({ ...prev, imageUrl: compressedImage }));
            } catch (error) { console.error("Image compression failed:", error); }
        }
    };

    const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const compressedImagesPromises = files.map(file => compressImage(file));
            try {
                const compressedImages = await Promise.all(compressedImagesPromises);
                setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...compressedImages] }));
            } catch (error) {
                console.error("Image compression failed for one or more images:", error);
                alert("Erreur lors de la compression d'une ou plusieurs images.");
            }
        }
    };
    
    const removeGalleryImage = (index: number) => setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));

    const handleArrayLikeChange = (e: React.ChangeEvent<HTMLTextAreaElement>, field: 'included' | 'excluded') => {
        setFormData(prev => ({ ...prev, [field]: e.target.value.split('\n') }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        const tourData = { ...formData, tags: tagsArray };

        if (isEditing && tour) {
            updateTour({ ...tourData, id: tour.id });
        } else {
            addTour({ ...tourData, imageUrl: formData.imageUrl || `https://picsum.photos/seed/tour${Date.now()}/600/400` });
        }
        navigate('/admin/tours');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main info */}
            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-4">
                <Input name="title" label="Titre" value={formData.title} onChange={handleChange} required />
                <Textarea name="description" label="Description" value={formData.description} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input name="price" label="Prix (€)" type="number" value={formData.price} onChange={handleChange} required />
                    <Input name="duration" label="Durée" value={formData.duration} onChange={handleChange} required />
                    <Input name="category" label="Catégorie" value={formData.category} onChange={handleChange} required />
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
                        <select id="status" name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="published">Publié</option>
                            <option value="draft">Brouillon</option>
                        </select>
                    </div>
                </div>
                 <Input name="tags" label="Tags (séparés par des virgules)" value={formData.tags} onChange={handleChange} placeholder="ex: Culture, Safari, UNESCO" />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image principale</label>
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Aperçu" className="mt-2 h-24 w-auto rounded-md object-cover"/>}
                    <input type="file" accept="image/*" onChange={handleMainImageChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
                </div>
            </div>

            {/* Itinerary */}
            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Itinéraire</h3>
                {formData.itinerary.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-2 border-b dark:border-slate-700">
                        <span className="font-bold pt-2 text-slate-800 dark:text-slate-200">Jour {index + 1}</span>
                        <div className="flex-grow space-y-2">
                            <Input label="" placeholder="Titre de la journée" value={item.title} onChange={(e) => handleItineraryChange(index, 'title', e.target.value)} />
                            <Textarea label="" placeholder="Description de la journée" value={item.description} onChange={(e) => handleItineraryChange(index, 'description', e.target.value)} rows={2} />
                        </div>
                        <button type="button" onClick={() => removeItineraryDay(index)} className="text-red-500 hover:text-red-700 mt-2">Supprimer</button>
                    </div>
                ))}
                <button type="button" onClick={addItineraryDay} className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900">Ajouter une journée</button>
            </div>
            
            {/* Gallery */}
            <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Galerie ({formData.gallery.length} images)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.gallery.map((img, index) => (
                        <div key={index} className="relative">
                            <img src={img} alt={`Galerie ${index+1}`} className="h-24 w-full object-cover rounded-md" />
                            <button type="button" onClick={() => removeGalleryImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-lg leading-none">&times;</button>
                        </div>
                    ))}
                </div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Ajouter des images à la galerie</label>
                <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
            </div>

             {/* Included/Excluded */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Inclus</h3>
                    <Textarea label="Un élément par ligne" value={formData.included.join('\n')} onChange={(e) => handleArrayLikeChange(e, 'included')} />
                </div>
                 <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Non inclus</h3>
                    <Textarea label="Un élément par ligne" value={formData.excluded.join('\n')} onChange={(e) => handleArrayLikeChange(e, 'excluded')} />
                </div>
            </div>

            <div className="flex gap-4">
                <button type="submit" className="px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Sauvegarder</button>
                <Link to="/admin/tours" className="px-4 py-2 rounded text-white bg-admin-secondary hover:bg-admin-secondary/90">Annuler</Link>
            </div>
        </form>
    );
};

export const ManageTours = () => {
    const { tours, deleteTour } = useAppStore();
    return (
        <div>
            <Link to="/admin/tours/add" className="mb-4 inline-block px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Ajouter un circuit</Link>
            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Prix</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {tours.map(tour => (
                            <tr key={tour.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-200">{tour.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-200">{tour.price}€</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tour.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                    {tour.status === 'published' ? 'Publié' : 'Brouillon'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/admin/tours/edit/${tour.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Éditer</Link>
                                    <button onClick={() => window.confirm('Êtes-vous sûr ?') && deleteTour(tour.id)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BlogForm = ({ post, onSave, onCancel }: { post?: BlogPost | null, onSave: (post: Omit<BlogPost, 'id'|'createdAt'> | BlogPost) => void, onCancel: () => void }) => {
  const [imageUrl, setImageUrl] = useState(post?.imageUrl || '');
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressedImage = await compressImage(e.target.files[0], 1024); // Larger for blog posts
        setImageUrl(compressedImage);
      } catch (error) {
        console.error("Image compression failed:", error);
        alert("Erreur lors de la compression de l'image.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const data = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        status: formData.get('status') as 'published' | 'draft',
        imageUrl: imageUrl || `https://picsum.photos/seed/blog${Date.now()}/800/400`,
    };
    onSave(post ? { ...data, id: post.id, createdAt: post.createdAt } : data);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
      <Input name="title" label="Titre de l'article" defaultValue={post?.title} required />
      <Textarea name="content" label="Contenu" defaultValue={post?.content} required rows={10} />
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
        <select id="status" name="status" defaultValue={post?.status || 'draft'} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image de l'article</label>
        {imageUrl && <img src={imageUrl} alt="Aperçu" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">L'image sera automatiquement compressée.</p>
      </div>
      <div className="flex gap-4">
        <button type="submit" className="px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Sauvegarder</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-white bg-admin-secondary hover:bg-admin-secondary/90">Annuler</button>
      </div>
    </form>
  );
};

export const ManageBlog = () => {
    const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAppStore();
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (post: Omit<BlogPost, 'id' | 'createdAt'> | BlogPost) => {
        if ('id' in post) {
            updateBlogPost(post);
        } else {
            addBlogPost(post);
        }
        setEditingPost(null);
        setIsAdding(false);
    };

    return (
        <div>
            <button onClick={() => { setIsAdding(true); setEditingPost(null); }} className="mb-4 px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Ajouter un article</button>
            {(isAdding || editingPost) && <BlogForm post={editingPost} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingPost(null); }} />}
            
            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {blogPosts.map(post => (
                            <tr key={post.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-200">{post.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-200">{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => { setEditingPost(post); setIsAdding(false); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Éditer</button>
                                    <button onClick={() => window.confirm('Êtes-vous sûr ?') && deleteBlogPost(post.id)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageHomepage = () => {
    const { homePageContent, updateHomePageContent } = useAppStore();
    const [content, setContent] = useState<HomePageContent>(homePageContent);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setContent(homePageContent);
    }, [homePageContent]);

    const handleChange = (section: 'hero' | 'engagement' | 'faq', key: string, value: string, index?: number) => {
        setContent(prev => {
            const newContent = JSON.parse(JSON.stringify(prev)); // Deep copy
            if ((section === 'engagement' || section === 'faq') && typeof index === 'number') {
                (newContent[section].items[index] as any)[key] = value;
            } else {
                (newContent[section] as any)[key] = value;
            }
            return newContent;
        });
        if (isSaved) setIsSaved(false);
    };
    
    const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressedImage = await compressImage(e.target.files[0], 1600);
                setContent(prev => ({
                    ...prev,
                    hero: {
                        ...prev.hero,
                        imageUrl: compressedImage,
                    },
                }));
                if (isSaved) setIsSaved(false);
            } catch (error) {
                console.error("Image compression failed:", error);
                alert("Erreur lors de la compression de l'image.");
            }
        }
    };

    const handleEngagementImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressedImage = await compressImage(e.target.files[0], 800);
                setContent(prev => ({
                    ...prev,
                    engagement: {
                        ...prev.engagement,
                        imageUrl: compressedImage,
                    },
                }));
                if (isSaved) setIsSaved(false);
            } catch (error) {
                console.error("Image compression failed:", error);
                alert("Erreur lors de la compression de l'image.");
            }
        }
    };

    const handleAddFaqItem = () => {
        setContent(prev => {
            const newContent = JSON.parse(JSON.stringify(prev));
            if (!newContent.faq) {
                newContent.faq = { title: '', subtitle: '', items: [] };
            }
            newContent.faq.items.push({ question: '', answer: '' });
            return newContent;
        });
        if (isSaved) setIsSaved(false);
    };

    const handleRemoveFaqItem = (index: number) => {
        setContent(prev => {
            const newContent = JSON.parse(JSON.stringify(prev));
            newContent.faq.items.splice(index, 1);
            return newContent;
        });
        if (isSaved) setIsSaved(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateHomePageContent(content);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section Hero */}
            <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Section "Héros"</h3>
                <div className="space-y-4">
                    <Input 
                        label="Titre principal" 
                        value={content.hero.title}
                        onChange={e => handleChange('hero', 'title', e.target.value)}
                    />
                    <Textarea 
                        label="Sous-titre" 
                        value={content.hero.subtitle}
                        onChange={e => handleChange('hero', 'subtitle', e.target.value)}
                        rows={2}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image de fond</label>
                        {content.hero.imageUrl && <img src={content.hero.imageUrl} alt="Aperçu" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
                        <input type="file" accept="image/*" onChange={handleHeroImageChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
                        <p className="text-xs text-gray-500 mt-1">L'image sera automatiquement compressée. Idéalement 1600px de large.</p>
                    </div>
                </div>
            </div>

            {/* Section Engagement */}
            <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Section "Engagement"</h3>
                 <div className="space-y-4">
                    <Input 
                        label="Titre de la section" 
                        value={content.engagement.title}
                        onChange={e => handleChange('engagement', 'title', e.target.value)}
                    />
                    <Textarea 
                        label="Sous-titre de la section" 
                        value={content.engagement.subtitle}
                        onChange={e => handleChange('engagement', 'subtitle', e.target.value)}
                        rows={3}
                    />
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image d'illustration</label>
                        {content.engagement.imageUrl && <img src={content.engagement.imageUrl} alt="Aperçu" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
                        <input type="file" accept="image/*" onChange={handleEngagementImageChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
                        <p className="text-xs text-gray-500 mt-1">L'image sera automatiquement compressée. Idéalement 800px de large.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        {content.engagement.items.map((item, index) => (
                            <div key={index} className="p-4 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Élément {index + 1}</h4>
                                <div className="space-y-3">
                                    <Input
                                        label="Titre de l'élément"
                                        value={item.title}
                                        onChange={e => handleChange('engagement', 'title', e.target.value, index)}
                                    />
                                    <Textarea
                                        label="Description de l'élément"
                                        value={item.description}
                                        onChange={e => handleChange('engagement', 'description', e.target.value, index)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Section FAQ */}
            <div className="p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-200">Section "FAQ"</h3>
                <div className="space-y-4">
                    <Input 
                        label="Titre de la section" 
                        value={content.faq?.title || ''}
                        onChange={e => handleChange('faq', 'title', e.target.value)}
                    />
                    <Textarea 
                        label="Sous-titre de la section" 
                        value={content.faq?.subtitle || ''}
                        onChange={e => handleChange('faq', 'subtitle', e.target.value)}
                        rows={2}
                    />
                    
                    <h4 className="font-semibold text-slate-700 dark:text-slate-200 pt-4">Questions et Réponses</h4>
                    <div className="space-y-4">
                        {content.faq?.items.map((item, index) => (
                            <div key={index} className="p-4 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 space-y-3 relative">
                                <Input
                                    label={`Question ${index + 1}`}
                                    value={item.question}
                                    onChange={e => handleChange('faq', 'question', e.target.value, index)}
                                />
                                <Textarea
                                    label={`Réponse ${index + 1}`}
                                    value={item.answer}
                                    onChange={e => handleChange('faq', 'answer', e.target.value, index)}
                                    rows={3}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveFaqItem(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg font-bold"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                    <button 
                        type="button" 
                        onClick={handleAddFaqItem}
                        className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900"
                    >
                        Ajouter une question
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button type="submit" className="px-6 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">
                    Sauvegarder les modifications
                </button>
                {isSaved && <p className="text-green-600">Modifications sauvegardées !</p>}
            </div>
        </form>
    );
};

export const ManageBookings = () => {
    const { bookings, updateBookingStatus } = useAppStore();
    const sortedBookings = useMemo(() => [...bookings].sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()), [bookings]);

    const handleExport = () => {
        const headers = [
            "ID", "Tour ID", "Titre du circuit", "Nom du client", "Email du client",
            "Téléphone du client", "Nombre de personnes", "Date de réservation", "Statut"
        ];
        
        const escapeCSV = (str: string | number) => {
            const s = String(str);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
        };

        const csvContent = [
            headers.join(','),
            ...sortedBookings.map(b => [
                escapeCSV(b.id),
                escapeCSV(b.tourId),
                escapeCSV(b.tourTitle),
                escapeCSV(b.customerName),
                escapeCSV(b.customerEmail),
                escapeCSV(b.customerPhone),
                escapeCSV(b.numberOfPeople),
                escapeCSV(new Date(b.bookingDate).toLocaleString('fr-FR')),
                escapeCSV(b.status)
            ].join(','))
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reservations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


    return (
        <div>
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleExport}
                    className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold"
                >
                    Exporter en CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Circuit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {sortedBookings.map(b => (
                            <tr key={b.id}>
                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{b.customerName}<br/><span className="text-sm text-gray-500 dark:text-gray-400">{b.customerEmail}</span></td>
                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{b.tourTitle}</td>
                                <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{new Date(b.bookingDate).toLocaleDateString()}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'Confirmée' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : b.status === 'Annulée' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>{b.status}</span></td>
                                <td className="px-6 py-4">
                                    <select value={b.status} onChange={e => updateBookingStatus(b.id, e.target.value as any)} className="rounded-md border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                        <option>En attente</option>
                                        <option>Confirmée</option>
                                        <option>Annulée</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const ManageMessages = () => {
    const { messages, markMessageAsRead } = useAppStore();
    const sortedMessages = useMemo(() => [...messages].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [messages]);
    
    return (
        <div className="space-y-4">
            {sortedMessages.map(m => (
                <Card key={m.id} className={`p-4 border-l-4 ${m.read ? 'border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800/50' : 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200">{m.name} <span className="font-normal text-gray-500 dark:text-gray-400">&lt;{m.email}&gt;</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{m.subject}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(m.date).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-gray-800 dark:text-gray-200">{m.message}</p>
                    {!m.read && <button onClick={() => markMessageAsRead(m.id)} className="mt-2 py-1 px-3 text-sm rounded text-white bg-admin-secondary hover:bg-admin-secondary/90">Marquer comme lu</button>}
                </Card>
            ))}
        </div>
    );
};

export const ManageTestimonials = () => {
    const { testimonials, updateTestimonialStatus } = useAppStore();

    const pending = testimonials.filter(t => t.status === 'pending');
    const approved = testimonials.filter(t => t.status === 'approved');
    const rejected = testimonials.filter(t => t.status === 'rejected');

    const TestimonialRow = ({ t }: { t: Testimonial }) => (
        <tr key={t.id}>
            <td className="px-4 py-3 align-top text-slate-800 dark:text-slate-200">{t.author}</td>
            <td className="px-4 py-3 align-top"><StarRatingDisplay rating={t.rating} /></td>
            <td className="px-4 py-3 align-top max-w-sm"><p className="text-sm text-gray-700 dark:text-gray-300">{t.reviewText}</p></td>
            <td className="px-4 py-3 align-top">
                {t.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => updateTestimonialStatus(t.id, 'approved')} className="px-3 py-1 text-sm rounded text-white bg-green-500 hover:bg-green-600">Approuver</button>
                        <button onClick={() => updateTestimonialStatus(t.id, 'rejected')} className="px-3 py-1 text-sm rounded text-white bg-red-500 hover:bg-red-600">Rejeter</button>
                    </div>
                )}
                 {t.status === 'approved' && (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => updateTestimonialStatus(t.id, 'rejected')} className="px-3 py-1 text-sm rounded text-white bg-red-500 hover:bg-red-600">Rejeter</button>
                    </div>
                )}
                 {t.status === 'rejected' && (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => updateTestimonialStatus(t.id, 'approved')} className="px-3 py-1 text-sm rounded text-white bg-green-500 hover:bg-green-600">Approuver</button>
                    </div>
                )}
            </td>
        </tr>
    );

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">Avis en attente ({pending.length})</h3>
                <TableSection title="" testimonials={pending} RowComponent={TestimonialRow} />
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">Avis approuvés ({approved.length})</h3>
                <TableSection title="" testimonials={approved} RowComponent={TestimonialRow} />
            </div>
             <div>
                <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-200">Avis rejetés ({rejected.length})</h3>
                <TableSection title="" testimonials={rejected} RowComponent={TestimonialRow} />
            </div>
        </div>
    );
};

const TableSection = ({ title, testimonials, RowComponent }: { title: string, testimonials: Testimonial[], RowComponent: React.FC<{t: Testimonial}> }) => (
    <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700"><tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Auteur</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Note</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Avis</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
            </tr></thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {testimonials.length > 0 ? testimonials.map(t => <RowComponent key={t.id} t={t} />) : <tr><td colSpan={4} className="p-4 text-center text-gray-500 dark:text-gray-400">Aucun avis dans cette catégorie.</td></tr>}
            </tbody>
        </table>
    </div>
);

const ExperienceForm = ({ experience, onSave, onCancel }: { experience?: Experience | null, onSave: (exp: Omit<Experience, 'id'> | Experience) => void, onCancel: () => void }) => {
  const [imageUrl, setImageUrl] = useState(experience?.imageUrl || '');
  const formRef = useRef<HTMLFormElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressedImage = await compressImage(e.target.files[0]);
        setImageUrl(compressedImage);
      } catch (error) {
        console.error("Image compression failed:", error);
        alert("Erreur lors de la compression de l'image.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    const data = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        status: formData.get('status') as 'published' | 'draft',
        imageUrl: imageUrl || `https://picsum.photos/seed/exp${Date.now()}/600/400`,
    };
    onSave(experience ? { ...data, id: experience.id } : data);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
      <Input name="title" label="Titre de l'expérience" defaultValue={experience?.title} required />
      <Textarea name="description" label="Description" defaultValue={experience?.description} required rows={5} />
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Statut</label>
        <select id="status" name="status" defaultValue={experience?.status || 'draft'} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
          <option value="published">Publiée</option>
          <option value="draft">Brouillon</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image de l'expérience</label>
        {imageUrl && <img src={imageUrl} alt="Aperçu" className="mt-2 h-32 w-auto rounded-md object-cover"/>}
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/50 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900" />
      </div>
      <div className="flex gap-4">
        <button type="submit" className="px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Sauvegarder</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-white bg-admin-secondary hover:bg-admin-secondary/90">Annuler</button>
      </div>
    </form>
  );
};

export const ManageExperiences = () => {
    const { experiences, addExperience, updateExperience, deleteExperience } = useAppStore();
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const handleSave = (exp: Omit<Experience, 'id'> | Experience) => {
        if ('id' in exp) {
            updateExperience(exp);
        } else {
            addExperience(exp);
        }
        setEditingExperience(null);
        setIsAdding(false);
    };

    return (
        <div>
            <button onClick={() => { setIsAdding(true); setEditingExperience(null); }} className="mb-4 px-4 py-2 rounded text-white bg-admin-primary hover:bg-admin-primary/90">Ajouter une expérience</button>
            {(isAdding || editingExperience) && <ExperienceForm experience={editingExperience} onSave={handleSave} onCancel={() => { setIsAdding(false); setEditingExperience(null); }} />}
            
            <div className="overflow-x-auto mt-6">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-700"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Titre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr></thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {experiences.map(exp => (
                            <tr key={exp.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-slate-800 dark:text-slate-200">{exp.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exp.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                                    {exp.status === 'published' ? 'Publiée' : 'Brouillon'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => { setEditingExperience(exp); setIsAdding(false); }} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Éditer</button>
                                    <button onClick={() => window.confirm('Êtes-vous sûr ?') && deleteExperience(exp.id)} className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Supprimer</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// Main export for routing
export const AdminPages = {
    AdminRoute,
    Login,
    AdminDashboard,
    ManageHomepage,
    ManageTours,
    ManageTourForm,
    ManageBlog,
    ManageExperiences,
    ManageBookings,
    ManageMessages,
    ManageTestimonials,
};