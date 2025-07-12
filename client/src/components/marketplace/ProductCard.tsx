import { Product } from '@shared/schema';
import { Star, Leaf } from 'lucide-react';

export interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const formatPrice = (price: number) => {
    // Show as green tokens
    return `${price} tokens`;
  };

  const formatTimeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  const getCategoryBadgeClass = (category: string) => {
    switch(category) {
      case 'books': return 'bg-primary-500 text-white';
      case 'electronics': return 'bg-secondary-500 text-white';
      case 'clothes': return 'bg-accent-500 text-gray-800';
      case 'stationery': return 'bg-primary-500 text-white';
      default: return 'bg-accent-500 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Choose a placeholder image based on category
  const getPlaceholderImage = (category: string) => {
    switch(category) {
      case 'books': 
        return 'https://images.unsplash.com/photo-1588580000645-4562a6d2c839?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300';
      case 'electronics': 
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300';
      case 'clothes': 
        return 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300';
      case 'stationery': 
        return 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300';
      default: 
        return 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300';
    }
  };

  return (
    <div 
      onClick={onClick} 
      className="bg-white bg-opacity-80 backdrop-blur-lg border border-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    >
      <div className="relative">
        <img 
          src={product.imageUrl || getPlaceholderImage(product.category)} 
          alt={product.title} 
          className="w-full"
        />
        <span className={`absolute top-3 left-3 ${getCategoryBadgeClass(product.category)} text-xs font-semibold px-2 py-1 rounded`}>
          {getCategoryLabel(product.category)}
        </span>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-800">{product.title}</h3>
          <span className="font-bold text-green-600 flex items-center">
            <Leaf className="h-4 w-4 mr-1" />
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3">
          {product.description.length > 80 
            ? `${product.description.substring(0, 80)}...` 
            : product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Posted {product.createdAt ? formatTimeSince(product.createdAt) : 'Recently'}
          </span>
          <div className="flex items-center text-sm">
            <span className="inline-block bg-green-100 text-green-800 font-medium rounded-full px-2 py-1 text-xs">
              <Star className="inline-block mr-1 h-3 w-3 text-yellow-400" />4.8
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
