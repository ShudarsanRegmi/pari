import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, User, LogOut, ShoppingBag, Settings, Leaf, Bot } from 'lucide-react';
import { FaRecycle } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

const Navbar = () => {
  const [location] = useLocation();
  const { currentUser, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch token balance for logged-in users
  const { data: tokenBalance } = useQuery<{balance: number; totalEarned: number; totalSpent: number}>({
    queryKey: [`/api/tokens/balance/${currentUser?.mongoUser?._id}`],
    enabled: !!currentUser?.mongoUser?._id,
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <FaRecycle className="text-primary-500 text-2xl mr-2" />
              <span className="font-display font-bold text-xl text-gray-800">Parivartana</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/marketplace" className={`${location === '/marketplace' ? 'border-primary-500 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-primary-500'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Marketplace
              </Link>
              <Link href="/about" className={`${location === '/about' ? 'border-primary-500 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-primary-500'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                How It Works
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-2">
            {currentUser && tokenBalance && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <Leaf className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {tokenBalance.balance.toLocaleString()} tokens
                </span>
              </div>
            )}
            <Link href="/sell">
              <Button variant="default" className="bg-accent-500 hover:bg-accent-600 text-gray-800">
                <span className="mr-1">+</span> List Item
              </Button>
            </Link>
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'User'} />
                      <AvatarFallback>{currentUser.displayName ? getInitials(currentUser.displayName) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex items-center">
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard?tab=listings" className="cursor-pointer flex items-center">
                      <ShoppingBag className="mr-2 h-4 w-4" /> My Listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/tokens" className="cursor-pointer flex items-center">
                      <Leaf className="mr-2 h-4 w-4" /> My Tokens
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/chatbot" className="cursor-pointer flex items-center">
                      <Bot className="mr-2 h-4 w-4" /> AI Assistant
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer flex items-center">
                        <Settings className="mr-2 h-4 w-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" /> Login
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link 
            href="/marketplace" 
            className={`${location === '/marketplace' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Marketplace
          </Link>
          <Link 
            href="/about" 
            className={`${location === '/about' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link 
            href="/sell" 
            className={`${location === '/sell' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            List Item
          </Link>
          {currentUser ? (
            <>
              <Link 
                href="/dashboard" 
                className={`${location === '/dashboard' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Dashboard
              </Link>
              <Link 
                href="/tokens" 
                className={`${location === '/tokens' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My Tokens
              </Link>
              <Link 
                href="/chatbot" 
                className={`${location === '/chatbot' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Assistant
              </Link>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className={`${location === '/admin' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              <button 
                className="block w-full text-left border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500 pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              className={`${location === '/login' ? 'bg-primary-50 border-primary-500 text-primary-500' : 'border-transparent text-gray-700 hover:bg-gray-100 hover:text-primary-500'} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
