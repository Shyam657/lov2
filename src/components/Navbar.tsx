
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Upload, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Chat', path: '/chat', icon: MessageSquare },
    { title: 'Upload', path: '/chat?upload=true', icon: Upload }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-background/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      )}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <span className="text-gradient font-bold text-2xl">LangRAG</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300',
                  isActive(link.path)
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-secondary/40'
                )}
              >
                {link.icon && <link.icon size={18} />}
                {link.title}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground/80 hover:text-foreground"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden glass-card p-4 mt-2 mb-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg transition-all',
                    isActive(link.path)
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-foreground/80 hover:text-foreground hover:bg-secondary/40'
                  )}
                  onClick={closeMenu}
                >
                  {link.icon && <link.icon size={18} />}
                  {link.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
