import { Link } from 'wouter';
import { Plus, ShoppingCart, Bot } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

const FloatingActionButton = () => {
  const { currentUser } = useAuth();

  return (
    <div className="sm:hidden fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
      <Link href="/sell">
        <button className="w-14 h-14 rounded-full bg-accent-500 text-gray-800 flex items-center justify-center shadow-lg hover:bg-accent-600 transition duration-300">
          <Plus className="h-6 w-6" />
        </button>
      </Link>
      
      {currentUser && (
        <Link href="/dashboard?tab=cart">
          <button className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition duration-300">
            <ShoppingCart className="h-6 w-6" />
          </button>
        </Link>
      )}
      
      <Link href="/chatbot">
        <button className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition duration-300">
          <Bot className="h-6 w-6" />
        </button>
      </Link>
    </div>
  );
};

export default FloatingActionButton;
