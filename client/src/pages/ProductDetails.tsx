import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Product, Review } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useRoute } from 'wouter';

import ContactSellerModal from '@/components/ui/ContactSellerModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Heart, Share2, ArrowLeft, MapPin, Clock, User, MessageCircle } from 'lucide-react';

const ProductDetails = () => {
  const [, setLocation] = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  // Get product ID from URL
  const [match, params] = useRoute('/product/:id');
  const productId = match ? params.id : null;
  
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  // Fetch product reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/reviews/product/${productId}`],
    enabled: !!productId,
  });

  // Check if user has contact access
  const { data: hasContactAccess } = useQuery<{ hasAccess: boolean }>({
    queryKey: [`/api/contact-access/check?productId=${productId}&buyerId=${currentUser?.mongoUser?._id}`],
    enabled: !!productId && !!currentUser?.mongoUser?._id,
  });

  // Create contact access mutation
  const createContactAccessMutation = useMutation({
    mutationFn: async () => {
      if (!product || !currentUser?.mongoUser?._id) return;
      
      const response = await apiRequest("POST", "/api/contact-access", {
        productId: product._id,
        buyerId: currentUser.mongoUser._id,
        sellerId: product.sellerId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contact-access/check?productId=${productId}&buyerId=${currentUser?.mongoUser?._id}`] });
      toast({
        title: "Contact Access Granted!",
        description: "You can now contact the seller about this item.",
      });
    },
    onError: (error) => {
      console.error("Error creating contact access:", error);
      toast({
        title: "Error",
        description: "Failed to get contact access. Please try again.",
        variant: "destructive",
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like_new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'new': return 'New';
      case 'like_new': return 'Like New';
      case 'good': return 'Good';
      case 'fair': return 'Fair';
      case 'poor': return 'Poor';
      default: return condition;
    }
  };

  if (!productId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
              <div className="flex space-x-2 mt-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-20 rounded" />
                ))}
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex space-x-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation('/marketplace')}>Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.mongoUser?._id === product.sellerId;
  const canContact = hasContactAccess?.hasAccess || isOwner;

  return (
    <>
      <Helmet>
        <title>{`${product.title} | Parivartana`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/marketplace')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div>
              <div className="relative">
                <img
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
                {product.isSold && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-lg">
                      SOLD
                    </div>
                  </div>
                )}
              </div>
              
              {/* Show image info if available */}
              {product.imageUrl && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Product image uploaded by seller
                  </p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-display font-bold text-gray-800">{product.title}</h1>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(product.price)}</p>
              </div>

              <div className="flex items-center space-x-4">
                <Badge className={getConditionColor(product.condition)}>
                  {getConditionText(product.condition)}
                </Badge>
                <Badge variant="outline">{product.category}</Badge>
                {product.isSold && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <Separator />

              {/* Seller Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Seller Information</h3>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback>
                      {getInitials(product.sellerName || 'Seller')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-800">{product.sellerName || 'Anonymous Seller'}</p>
                    <p className="text-sm text-gray-500">Member since {formatDate(product.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!product.isSold && !isOwner && (
                  <>
                    {canContact ? (
                      <ContactSellerModal
                        product={product}
                        trigger={
                          <Button className="flex-1 bg-primary-500 hover:bg-primary-600">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Contact Seller
                          </Button>
                        }
                      />
                    ) : (
                      <Button 
                        onClick={() => createContactAccessMutation.mutate()}
                        className="flex-1 bg-primary-500 hover:bg-primary-600"
                        disabled={createContactAccessMutation.isPending}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {createContactAccessMutation.isPending ? 'Processing...' : 'Get Contact Info'}
                      </Button>
                    )}
                  </>
                )}
                
                {isOwner && (
                  <Button 
                    onClick={() => setLocation(`/product/${product._id}/edit`)}
                    variant="outline"
                    className="flex-1"
                  >
                    Edit Listing
                  </Button>
                )}

                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>

              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition</span>
                    <span className="font-medium">{getConditionText(product.condition)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-medium">{formatDate(product.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Campus Area
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-gray-800">Reviews</h2>
              <Button variant="outline" size="sm">
                Write a Review
              </Button>
            </div>

            {isLoadingReviews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reviews && reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review._id}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback>
                            {getInitials(review.reviewerName || 'User')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800">
                              {review.reviewerName || 'Anonymous'}
                            </h4>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">Be the first to review this product!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

    </>
  );
};

export default ProductDetails;
