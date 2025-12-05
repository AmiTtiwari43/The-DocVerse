import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import CitySelector from './CitySelector';
import { Bell, LogOut, User, Menu, X, Sun, Moon, Settings, UserCircle, LayoutDashboard, Search, Heart, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { user, logout } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hide city selector on auth pages
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Mediverse
              </span>
            </Link>
            {!isAuthPage && (
              <div className="hidden md:block">
                <CitySelector />
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'patient' && (
                  <>
                    <Link to="/search">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Search className="h-4 w-4" />
                        Find Doctors
                      </Button>
                    </Link>
                    <Link to="/favorites">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Heart className="h-4 w-4" />
                        Favorites
                      </Button>
                    </Link>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}
                {user.role === 'doctor' && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/dashboard">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 h-9 px-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.profilePhoto} />
                        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-2">
            {!isAuthPage && (
              <div className="px-2">
                <CitySelector />
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="w-full text-left px-2 py-2 hover:bg-accent rounded flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            {user ? (
              <>
                <Link to="/search" className="block px-2 py-2 hover:bg-accent rounded">
                  Find Doctors
                </Link>
                <Link to="/favorites" className="block px-2 py-2 hover:bg-accent rounded">
                  Favorites
                </Link>
                <Link to="/dashboard" className="block px-2 py-2 hover:bg-accent rounded">
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 px-2 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-2 py-2 hover:bg-accent rounded flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-2 py-2 hover:bg-accent rounded">
                  Login
                </Link>
                <Link to="/signup" className="block px-2 py-2 hover:bg-accent rounded">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

