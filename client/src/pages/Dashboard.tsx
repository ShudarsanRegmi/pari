import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Product, Transaction } from '@shared/schema';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';

import ProductCard from '@/components/marketplace/ProductCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  Clock,
  CreditCard,
  DollarSign,
  Package,
  PlusCircle,
  Settings,
  ShoppingBag,
  Star,
  Tag
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check for tab from query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const tabParam = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  
  // Update active tab when URL query parameter changes
  useEffect(() => {
    if (tabParam && ['overview', 'listings', 'purchases', 'transactions', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // When tab changes, update URL without navigating
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const newUrl = `${window.location.pathname}?tab=${value}`;
    window.history.pushState(null, '', newUrl);
  };

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !currentUser) {
      setLocation('/login?redirect=/dashboard');
    }
  }, [currentUser, loading, setLocation]);

  // Fetch user's products
  const { data: userProducts, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ['/api/products?sellerId=1'], // Replace with actual user ID in a real app
    enabled: !!currentUser,
  });

  // Fetch user's transactions
  const { data: userTransactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/user/1'], // Replace with actual user ID in a real app
    enabled: !!currentUser,
  });
  
  // Mark product as sold mutation
  const markProductAsSoldMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await apiRequest("PATCH", `/api/products/${productId}/mark-sold`, {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate product queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products?sellerId=1'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/user/1'] });
      
      toast({
        title: "Product Marked as Sold!",
        description: "The product has been marked as sold and a transaction record has been created.",
      });
    },
    onError: (error) => {
      console.error("Error marking product as sold:", error);
      toast({
        title: "Failed to Mark as Sold",
        description: "There was an error marking this product as sold. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to mark a product as sold
  const markProductAsSold = (productId: number) => {
    markProductAsSoldMutation.mutate(productId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // Redirect will happen in useEffect
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    // Convert from paisa to rupees
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate statistics
  const activeListings = userProducts?.filter(p => !p.isSold)?.length || 0;
  const soldItems = userProducts?.filter(p => p.isSold)?.length || 0;
  
  const totalEarnings = userTransactions
    ?.filter(t => t.type === 'sale' && t.status === 'completed' && t.sellerId === 1) // Hard-coded ID for demo
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const pendingPayments = userTransactions
    ?.filter(t => t.status === 'pending' && t.sellerId === 1) // Hard-coded ID for demo
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | Parivartana</title>
        <meta name="description" content="Manage your listings, track your purchases, and view your transaction history on Parivartana." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Manage your listings and purchases</p>
          </div>
          <Button onClick={() => setLocation('/sell')} className="bg-primary-500 hover:bg-primary-600">
            <PlusCircle className="mr-2 h-4 w-4" /> List New Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Listings</CardTitle>
              <Package className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeListings}</div>
              <p className="text-xs text-gray-500 mt-1">Items currently for sale</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Sold Items</CardTitle>
              <ShoppingBag className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldItems}</div>
              <p className="text-xs text-gray-500 mt-1">Completed transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
              <p className="text-xs text-gray-500 mt-1">From all your sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Seller Rating</CardTitle>
              <Star className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8</div>
              <p className="text-xs text-gray-500 mt-1">Based on buyer reviews</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="overview" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Listings</CardTitle>
                    <CardDescription>Your most recently listed items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userProducts && userProducts.length > 0 ? (
                      <div className="space-y-4">
                        {userProducts.slice(0, 3).map((product) => (
                          <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <Tag className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{product.title}</p>
                                <p className="text-sm text-gray-500">{formatCurrency(product.price)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2 py-1 rounded-full ${product.isSold ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {product.isSold ? 'Sold' : 'Active'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No listings yet</p>
                        <Button 
                          onClick={() => setLocation('/sell')} 
                          variant="outline" 
                          className="mt-2"
                        >
                          List an Item
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest financial activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingTransactions ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : userTransactions && userTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {userTransactions.slice(0, 3).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'sale' 
                                  ? 'bg-green-100 text-green-500' 
                                  : 'bg-accent-100 text-accent-500'
                              }`}>
                                {transaction.type === 'sale' ? (
                                  <DollarSign className="h-5 w-5" />
                                ) : (
                                  <ShoppingBag className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {transaction.type === 'sale' ? 'Item Sold' : 'Purchase'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  <Clock className="inline h-3 w-3 mr-1" />
                                  {formatDate(transaction.createdAt)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium ${
                                transaction.transactionType === 'listing_fee' 
                                  ? 'text-red-500' 
                                  : 'text-green-500'
                              }`}>
                                {transaction.transactionType === 'listing_fee' 
                                  ? `-${formatCurrency(transaction.amount)}` 
                                  : `+${formatCurrency(transaction.amount)}`}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No transactions yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                  <CardDescription>Tips to make the most of Parivartana</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="bg-primary-50 p-4 rounded-lg">
                      <h3 className="font-medium text-primary-800 mb-2">Listing Items</h3>
                      <ul className="text-sm text-primary-700 space-y-1">
                        <li>• Use clear, well-lit photos</li>
                        <li>• Be honest about condition</li>
                        <li>• Price competitively</li>
                        <li>• Respond to inquiries promptly</li>
                      </ul>
                    </div>
                    <div className="bg-accent-50 p-4 rounded-lg">
                      <h3 className="font-medium text-accent-800 mb-2">Safe Transactions</h3>
                      <ul className="text-sm text-accent-700 space-y-1">
                        <li>• Meet in public places</li>
                        <li>• Inspect items before purchasing</li>
                        <li>• Use campus safe zones</li>
                        <li>• Report suspicious activity</li>
                      </ul>
                    </div>
                    <div className="bg-secondary-50 p-4 rounded-lg">
                      <h3 className="font-medium text-secondary-800 mb-2">Growing Reputation</h3>
                      <ul className="text-sm text-secondary-700 space-y-1">
                        <li>• Be reliable and punctual</li>
                        <li>• Communicate clearly</li>
                        <li>• Leave and ask for reviews</li>
                        <li>• Build your campus network</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="listings">
              <Card>
                <CardHeader>
                  <CardTitle>My Listings</CardTitle>
                  <CardDescription>Manage all your listed items</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
                          <Skeleton className="h-48 w-full" />
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-6 w-1/4" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6 mb-3" />
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-4 w-1/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userProducts && userProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userProducts.map((product) => (
                        <div key={product.id} className="relative">
                          {product.isSold ? (
                            <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm">
                                Sold
                              </div>
                            </div>
                          ) : (
                            <div className="absolute top-2 right-2 z-10">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white" 
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent card click
                                  markProductAsSold(product.id);
                                }}
                              >
                                Mark as Sold
                              </Button>
                            </div>
                          )}
                          <ProductCard 
                            product={product} 
                            onClick={() => setLocation(`/product/${product.id}`)} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Listings Yet</h3>
                      <p className="text-gray-500 mb-4">
                        You haven't listed any items for sale yet.
                      </p>
                      <Button onClick={() => setLocation('/sell')} className="bg-primary-500 hover:bg-primary-600">
                        List Your First Item
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="purchases">
              <Card>
                <CardHeader>
                  <CardTitle>My Purchases</CardTitle>
                  <CardDescription>Items you've bought and contacted sellers about</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Purchases Yet</h3>
                    <p className="text-gray-500 mb-4">
                      You haven't made any purchases or contacted sellers yet.
                    </p>
                    <Button onClick={() => setLocation('/marketplace')} className="bg-primary-500 hover:bg-primary-600">
                      Browse Marketplace
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                  <CardDescription>Record of all your financial activities</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-grow">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : userTransactions && userTransactions.length > 0 ? (
                    <div className="space-y-4">
                      {userTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border-b last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              transaction.transactionType === 'listing_fee' 
                                ? 'bg-primary-100 text-primary-500' 
                                : 'bg-accent-100 text-accent-500'
                            }`}>
                              {transaction.transactionType === 'listing_fee' ? (
                                <Tag className="h-5 w-5" />
                              ) : (
                                <DollarSign className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {transaction.transactionType === 'listing_fee' ? 'Listing Fee' : 'Contact Fee'}
                                {transaction.productId ? ` (Item #${transaction.productId})` : ''}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center">
                                <Clock className="inline h-3 w-3 mr-1" />
                                {formatDate(transaction.createdAt)}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                  transaction.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.transactionType === 'listing_fee' 
                                ? 'text-red-500' 
                                : 'text-green-500'
                            }`}>
                              {transaction.transactionType === 'listing_fee' 
                                ? `-${formatCurrency(transaction.amount)}` 
                                : `+${formatCurrency(transaction.amount)}`}
                            </p>
                            <p className="text-xs text-gray-500">Payment ID: {transaction.paymentId || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Transactions Yet</h3>
                      <p className="text-gray-500 mb-4">
                        You haven't made any financial transactions yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || 'User'} />
                        <AvatarFallback className="text-lg">{currentUser.displayName ? getInitials(currentUser.displayName) : 'U'}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-medium text-gray-900">{currentUser.displayName}</h3>
                      <p className="text-gray-500">{currentUser.email}</p>
                      
                      <div className="mt-6 w-full space-y-4">
                        <div className="border rounded-md p-3">
                          <p className="text-sm font-medium text-gray-500">Member Since</p>
                          <p className="text-gray-900">April 2023</p>
                        </div>
                        <div className="border rounded-md p-3">
                          <p className="text-sm font-medium text-gray-500">Seller Rating</p>
                          <div className="flex items-center">
                            <p className="text-gray-900 mr-1">4.8</p>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="mt-6 w-full" 
                        onClick={() => setLocation('/profile/edit')}
                      >
                        <Settings className="mr-2 h-4 w-4" /> Edit Profile
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        className="mt-2 w-full" 
                        onClick={logout}
                      >
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">Email Notifications</p>
                              <p className="text-sm text-gray-500">Receive emails about your activity</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">In-App Notifications</p>
                              <p className="text-sm text-gray-500">Manage your notification settings</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Security</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">Change Password</p>
                              <p className="text-sm text-gray-500">Update your password</p>
                            </div>
                            <Button variant="outline" size="sm">Change</Button>
                          </div>
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">Two-Factor Authentication</p>
                              <p className="text-sm text-gray-500">Add an extra layer of security</p>
                            </div>
                            <Button variant="outline" size="sm">Enable</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Privacy</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">Privacy Settings</p>
                              <p className="text-sm text-gray-500">Control your data and visibility</p>
                            </div>
                            <Button variant="outline" size="sm">Configure</Button>
                          </div>
                          <div className="flex items-center justify-between border p-3 rounded-md">
                            <div>
                              <p className="font-medium">Delete Account</p>
                              <p className="text-sm text-gray-500">Permanently delete your account</p>
                            </div>
                            <Button variant="destructive" size="sm">Delete</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default Dashboard;
