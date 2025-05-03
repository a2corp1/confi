import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Transition } from '@headlessui/react';
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../common/ThemeToggle';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const onSearch = (data) => {
    if (data.search.trim() !== '') {
      navigate(`/token/${data.search.trim()}`);
      reset();
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-dark-950/90 shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Nav Links - Desktop */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Logo className="h-8 w-auto" />
            </div>

            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-white bg-primary-900/30'
                        : 'text-dark-300 hover:text-white hover:bg-dark-800'
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/search"
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-white bg-primary-900/30'
                        : 'text-dark-300 hover:text-white hover:bg-dark-800'
                    }`
                  }
                >
                  Explorer
                </NavLink>
              </div>
            </div>
          </div>

          {/* Search Bar and Theme Toggle - Desktop */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSubmit(onSearch)} className="mr-4">
              <div className="relative">
                <input
                  {...register('search')}
                  type="text"
                  placeholder="Search token address..."
                  className="input w-72 py-1.5 pl-10 pr-3 text-sm"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-dark-400" />
                </div>
              </div>
            </form>
            <ThemeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="p-2 rounded-md text-dark-400 hover:text-white focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Transition
        show={isOpen}
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition duration-150 ease-in"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="md:hidden bg-dark-900/95 backdrop-blur-md border-t border-dark-800" id="mobile-menu">
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-white bg-primary-900/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-white bg-primary-900/30'
                    : 'text-dark-300 hover:text-white hover:bg-dark-800'
                }`
              }
            >
              Explorer
            </NavLink>
          </div>
          <div className="px-4 py-3 border-t border-dark-800">
            <form onSubmit={handleSubmit(onSearch)} className="mt-1">
              <div className="relative">
                <input
                  {...register('search')}
                  type="text"
                  placeholder="Search token address..."
                  className="input w-full py-2 pl-10 pr-3"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-dark-400" />
                </div>
              </div>
            </form>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-dark-400">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;