import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Search, UserCheck } from 'lucide-react';
import axios from 'axios';
import ArtisanCard from '../components/ArtisanCard';
import { Artisan } from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

interface JobCategory {
  name: string;
  image: string;
}

const Home: React.FC = () => {
  const [featuredArtisans, setFeaturedArtisans] = useState<Artisan[]>([]);

  useEffect(() => {
    fetchFeaturedArtisans();
  }, []);

  const fetchFeaturedArtisans = async () => {
    try {
      const response = await axios.get<Artisan[]>(`${API}/artisans`);
      setFeaturedArtisans(response.data.slice(0, 6));
    } catch (error) {
      console.error('Error fetching artisans:', error);
    }
  };

  const jobCategories: JobCategory[] = [
    { name: 'Mechanic', image: 'https://images.unsplash.com/photo-1743314777689-1bb71ae148ca?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBtZWNoYW5pYyUyMHdvcmtlciUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzcxNDg0ODk1fDA&ixlib=rb-4.1.0&q=85' },
    { name: 'Electrician', image: 'https://images.pexels.com/photos/21812143/pexels-photo-21812143.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
    { name: 'Plumber', image: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' },
    { name: 'Carpenter', image: 'https://images.unsplash.com/photo-1688240817677-d28b8e232dd4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNTl8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjBtYW4lMjBzYW5kaW5nJTIwd29vZCUyMHByb2Zlc3Npb25hbHxlbnwwfHx8fDE3NzE0ODQ5MTJ8MA&ixlib=rb-4.1.0&q=85' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-7 flex flex-col justify-center">
              <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none text-slate-900 mb-6" data-testid="hero-title">
                Find Trusted Blue Collar <span className="text-primary">Artisans</span> in Abuja
              </h1>
              <p className="text-lg leading-relaxed text-slate-600 mb-8 max-w-xl" data-testid="hero-subtitle">
                Connect with verified mechanics, electricians, plumbers, and more. Quality workmanship guaranteed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/browse"
                  className="bg-primary text-white hover:bg-primary-hover px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-2"
                  data-testid="hero-browse-btn"
                >
                  Browse Artisans
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/apply"
                  className="bg-white text-primary border-2 border-primary hover:bg-primary/5 px-8 py-4 font-bold tracking-wide transition-all inline-flex items-center gap-2"
                  data-testid="hero-apply-btn"
                >
                  Join as Worker
                </Link>
              </div>
            </div>
            
            <div className="md:col-span-5">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/4312856/pexels-photo-4312856.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
                  alt="Professional tools"
                  className="w-full h-[400px] md:h-[500px] object-cover shadow-2xl"
                  data-testid="hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-slate-50" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-wide uppercase text-slate-500 mb-3">Services</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Browse by Category</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jobCategories.map((category, index) => (
              <Link
                key={index}
                to={`/browse?job_type=${category.name}`}
                className="group"
                data-testid={`category-card-${category.name.toLowerCase()}`}
              >
                <div className="relative overflow-hidden h-64 bg-slate-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{category.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 bg-white" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-wide uppercase text-slate-500 mb-3">Process</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center" data-testid="step-1">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Search className="text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">1. Search</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Browse our verified artisans by location and job type to find the perfect match for your needs.
              </p>
            </div>
            
            <div className="text-center" data-testid="step-2">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <UserCheck className="text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">2. Connect</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Review profiles, ratings, and contact the artisan directly via phone to discuss your project.
              </p>
            </div>
            
            <div className="text-center" data-testid="step-3">
              <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-primary" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">3. Review</h3>
              <p className="text-base text-slate-600 leading-relaxed">
                After the job is done, share your experience by leaving a rating and review for others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {featuredArtisans.length > 0 && (
        <section className="py-20 md:py-32 bg-slate-50" data-testid="featured-artisans-section">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-wide uppercase text-slate-500 mb-3">Featured</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">Top Rated Artisans</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredArtisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-bold text-lg transition-colors"
                data-testid="view-all-btn"
              >
                View All Artisans
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-20 md:py-32 bg-primary" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Are You a Skilled Worker?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join Blue Mill and connect with clients looking for your expertise. Submit your application today.
          </p>
          <Link
            to="/apply"
            className="bg-white text-primary hover:bg-slate-50 px-8 py-4 font-bold tracking-wide shadow-lg hover:shadow-xl transition-all active:scale-95 inline-block"
            data-testid="cta-apply-btn"
          >
            Apply Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
