import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('admin_token');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-md'
      } border-b border-slate-100`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center" data-testid="navbar-home-link">
            <div className="w-40 h-10 bg-slate-100 flex items-center justify-center text-slate-400 text-xs tracking-widest uppercase border border-dashed border-slate-300">
              LOGO HERE
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="navbar-home"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="navbar-browse"
            >
              Browse Artisans
            </Link>
            <Link
              to="/apply"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
              data-testid="navbar-apply"
            >
              Apply as Worker
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-slate-600 hover:text-primary font-medium transition-colors"
                  data-testid="navbar-dashboard"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2 font-medium tracking-wide transition-all"
                  data-testid="navbar-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="bg-primary text-white hover:bg-primary-hover px-6 py-2 font-bold tracking-wide shadow-md hover:shadow-lg transition-all"
                data-testid="navbar-admin-login"
              >
                Admin Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100" data-testid="mobile-menu">
          <div className="px-6 py-4 space-y-3">
            <Link
              to="/"
              className="block text-slate-600 hover:text-primary font-medium"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-home-link"
            >
              Home
            </Link>
            <Link
              to="/browse"
              className="block text-slate-600 hover:text-primary font-medium"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-browse-link"
            >
              Browse Artisans
            </Link>
            <Link
              to="/apply"
              className="block text-slate-600 hover:text-primary font-medium"
              onClick={() => setMobileMenuOpen(false)}
              data-testid="mobile-apply-link"
            >
              Apply as Worker
            </Link>
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="block text-slate-600 hover:text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="mobile-dashboard-link"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left bg-slate-100 text-slate-700 hover:bg-slate-200 px-6 py-2 font-medium"
                  data-testid="mobile-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="block bg-primary text-white hover:bg-primary-hover px-6 py-2 font-bold text-center"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="mobile-admin-login"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
