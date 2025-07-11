import { useAuth } from '@/lib/useAuth';
import { Product } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useLocation, useRoute } from 'wouter';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ContactSellerModal from '@/components/ui/ContactSellerModal';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Info, MapPin, Star, Tag } from 'lucide-react';
import { FaBook, FaLaptop, FaPencilAlt, FaPuzzlePiece, FaTshirt } from 'react-icons/fa';

const ProductDetails = () => {
  const [match, params] = useRoute('/product/:id');
  const [, navigate] = useLocation();
  const { currentUser } = useAuth();
  const productId = match ? parseInt(params.id, 10) : 0;

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Placeholder seller rating - in a real app, fetch from reviews API
  const sellerRating = 4.8;

  if (error) {
    console.error('Error fetching product:', error);
  }

  const formatPrice = (price: number) => {
    // Convert from paisa to rupees
    return `₹${(price / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'books': return <FaBook className="h-5 w-5" />;
      case 'electronics': return <FaLaptop className="h-5 w-5" />;
      case 'clothes': return <FaTshirt className="h-5 w-5" />;
      case 'stationery': return <FaPencilAlt className="h-5 w-5" />;
      default: return <FaPuzzlePiece className="h-5 w-5" />;
    }
  };

  const getCategoryColorClass = (category: string) => {
    switch(category) {
      case 'books': return 'bg-primary-100 text-primary-500';
      case 'electronics': return 'bg-secondary-100 text-secondary-500';
      case 'clothes': return 'bg-accent-100 text-accent-500';
      case 'stationery': return 'bg-primary-100 text-primary-500';
      default: return 'bg-secondary-100 text-secondary-500';
    }
  };

  const getConditionLabel = (condition: string) => {
    const labels: { [key: string]: string } = {
      'new': 'New',
      'like_new': 'Like New',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor'
    };
    return labels[condition] || condition;
  };

  const getConditionColorClass = (condition: string) => {
    const colors: { [key: string]: string } = {
      'new': 'bg-green-100 text-green-700',
      'like_new': 'bg-green-100 text-green-700',
      'good': 'bg-blue-100 text-blue-700',
      'fair': 'bg-yellow-100 text-yellow-700',
      'poor': 'bg-red-100 text-red-700'
    };
    return colors[condition] || 'bg-gray-100 text-gray-700';
  };

  // Choose a placeholder image based on category
  const getPlaceholderImage = (category: string) => {
    switch(category) {
      case 'books': 
        return 'https://images.unsplash.com/photo-1588580000645-4562a6d2c839?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
      case 'electronics': 
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
      case 'clothes': 
        return 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
      case 'stationery': 
        return 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
      default: 
        return 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600';
    }
  };

  return (
    <>
      <Helmet>
        <title>{product ? `${product.title} | Parivartana` : 'Product Details | Parivartana'}</title>
        <meta 
          name="description" 
          content={product 
            ? `${product.title} for sale at ${formatPrice(product.price)}. ${product.description.substring(0, 120)}...` 
            : 'View product details on Parivartana - the sustainable student marketplace.'}
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/marketplace')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full h-[400px] rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-12 w-full mt-4" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg overflow-hidden shadow-md">
                <img 
                  src={product.imageUrl || getPlaceholderImage(product.category)} 
                  alt={product.title} 
                  className="w-full h-auto object-cover max-h-[400px]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">{product.title}</h1>
              <div className="mt-2 text-2xl font-bold text-primary-500">{formatPrice(product.price)}</div>
              
              <div className="flex gap-3 mt-4">
                <Badge variant="outline" className={getCategoryColorClass(product.category)}>
                  <span className="flex items-center gap-1">
                    {getCategoryIcon(product.category)}
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </span>
                </Badge>
                <Badge variant="outline" className={getConditionColorClass(product.condition)}>
                  {getConditionLabel(product.condition)}
                </Badge>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Posted on {formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Campus Pickup</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-2" />
                  <span className="text-sm text-gray-600">Seller Rating: {sellerRating}/5</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Item ID: #{product.id}</span>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 text-sm">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Contact Fee</p>
                      <p className="text-yellow-700">Pay ₹5 to access seller contact information. Meet in public places for exchanges.</p>
                    </div>
                  </div>
                </div>
                
                <ContactSellerModal product={product} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for might have been removed or doesn't exist.</p>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Marketplace
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetails;
