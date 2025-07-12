import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Product } from '@shared/schema';
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
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Edit,
  Trash2,
  MoreVertical,
  Leaf
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Token transaction interface
interface TokenTransaction {
  _id: string;
  userId: string;
  type: 'purchase' | 'sale' | 'reward' | 'load';
  amount: number;
  description: string;
  productId?: string;
  sellerId?: string;
  buyerId?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Token balance interface
interface TokenBalance {
  _id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

const Dashboard = () => {
  const { currentUser, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check for tab from query parameter
  const queryParams = new URLSearchParams(window.location.search);
  const tabParam = queryParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');
  
  // State for editing products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });
  
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
    queryKey: [`/api/products?sellerId=${currentUser?.mongoUser?._id}`],
    enabled: !!currentUser?.mongoUser?._id,
  });

  // Fetch user's token balance
  const { data: tokenBalance, isLoading: isLoadingTokenBalance } = useQuery<TokenBalance>({
    queryKey: [`/api/tokens/balance/${currentUser?.mongoUser?._id}`],
    enabled: !!currentUser?.mongoUser?._id,
  });

  // Fetch user's token transactions
  const { data: tokenTransactions, isLoading: isLoadingTokenTransactions } = useQuery<TokenTransaction[]>({
    queryKey: [`/api/tokens/transactions/${currentUser?.mongoUser?._id}`],
    enabled: !!currentUser?.mongoUser?._id,
  });

  // Fetch user's EcoImpact
  const { data: ecoImpact, isLoading: isLoadingEcoImpact } = useQuery<{ ecoImpact: number }>({
    queryKey: [`/api/eco-impact/${currentUser?.mongoUser?._id}`],
    enabled: !!currentUser?.mongoUser?._id,
  });
  
  // Mark product as sold mutation
  const markProductAsSoldMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("PATCH", `/api/products/${productId}/mark-sold`, {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate product queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/products?sellerId=${currentUser?.mongoUser?._id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tokens/transactions/${currentUser?.mongoUser?._id}`] });
      
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

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ productId, data }: { productId: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/products/${productId}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/products?sellerId=${currentUser?.mongoUser?._id}`] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: "Product Updated!",
        description: "The product details have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast({
        title: "Failed to Update Product",
        description: "There was an error updating the product. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest("DELETE", `/api/products/${productId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/products?sellerId=${currentUser?.mongoUser?._id}`] });
      toast({
        title: "Product Delisted!",
        description: "The product has been removed from your listings.",
      });
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast({
        title: "Failed to Delist Product",
        description: "There was an error removing the product. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Function to mark a product as sold
  const markProductAsSold = (productId: string) => {
    markProductAsSoldMutation.mutate(productId);
  };

  // Function to open edit dialog
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      imageUrl: product.imageUrl || ''
    });
    setIsEditDialogOpen(true);
  };

  // Function to handle edit form submission
  const handleEditSubmit = () => {
    if (!editingProduct) return;
    
    updateProductMutation.mutate({
      productId: editingProduct._id!,
      data: {
        title: editFormData.title,
        description: editFormData.description,
        price: parseInt(editFormData.price),
        category: editFormData.category,
        imageUrl: editFormData.imageUrl || null
      }
    });
  };

  // Function to delete a product
  const deleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delist this product? This action cannot be undone.')) {
      deleteProductMutation.mutate(productId);
    }
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

  const formatTokens = (amount: number) => {
    return `${amount} tokens`;
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
  
  const totalEarnings = tokenTransactions
    ?.filter(t => t.type === 'sale' && t.status === 'completed' && t.sellerId === currentUser?.mongoUser?._id)
    ?.reduce((sum, t) => sum + t.amount, 0) || 0;
  
  const totalSpent = tokenTransactions
    ?.filter(t => t.type === 'purchase' && t.status === 'completed' && t.buyerId === currentUser?.mongoUser?._id)
    ?.reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;

  const currentBalance = tokenBalance?.balance || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | Parivartana</title>
        <meta name="description" content="Manage your listings, track your purchases, and view your transaction history on Parivartana." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {currentUser.displayName || currentUser.email}</p>
          </div>
          <div className="flex items-center space-x-4">
          <Button onClick={() => setLocation('/sell')} className="bg-primary-500 hover:bg-primary-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              List Item
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
          </Button>
        </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="purchases">Purchases</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeListings}</div>
                  <p className="text-xs text-muted-foreground">
                    Items currently for sale
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{soldItems}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully sold
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTokens(currentBalance)}</div>
                  <p className="text-xs text-muted-foreground">
                    Available tokens
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatTokens(totalEarnings)}</div>
                  <p className="text-xs text-muted-foreground">
                    From completed sales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">EcoImpact</CardTitle>
                  <Leaf className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoadingEcoImpact ? '...' : `${ecoImpact?.ecoImpact || 0} kg`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CO₂ saved
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Listings</CardTitle>
                  <CardDescription>
                    Your most recent items for sale
                  </CardDescription>
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
                        <div key={product._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <Tag className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{product.title}</p>
                              <p className="text-sm text-gray-500">{formatTokens(product.price ?? 0)}</p>
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
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No listings yet</h3>
                      <p className="text-gray-500 mb-4">Start selling your items to see them here</p>
                      <Button onClick={() => setLocation('/sell')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        List Your First Item
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                  <CardTitle>Recent Token Transactions</CardTitle>
                  <CardDescription>
                    Your latest buying and selling activity
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  {isLoadingTokenTransactions ? (
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
                  ) : tokenTransactions && tokenTransactions.length > 0 ? (
                      <div className="space-y-4">
                      {tokenTransactions.slice(0, 3).map((transaction) => (
                        <div key={transaction._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <CreditCard className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                {transaction.type === 'sale' ? 'Sale' : 
                                 transaction.type === 'purchase' ? 'Purchase' :
                                 transaction.type === 'reward' ? 'Reward' : 'Load'}
                              </p>
                              <p className="text-sm text-gray-500">{formatTokens(Math.abs(transaction.amount))}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
                      <p className="text-gray-500">Your buying and selling activity will appear here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-800">My Listings</h2>
                <p className="text-gray-600">Manage your items for sale</p>
                    </div>
              <Button onClick={() => setLocation('/sell')} className="bg-primary-500 hover:bg-primary-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Listing
              </Button>
                  </div>

                  {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
                  <div key={product._id} className="relative">
                          {product.isSold ? (
                            <div className="absolute inset-0 bg-white bg-opacity-75 z-10 flex items-center justify-center">
                              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium text-sm">
                                Sold
                              </div>
                            </div>
                          ) : (
                      <div className="absolute top-2 right-2 z-10 flex space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="bg-white/90 backdrop-blur-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => markProductAsSold(product._id!)}
                              className="text-green-600"
                            >
                              <ShoppingBag className="mr-2 h-4 w-4" />
                                Mark as Sold
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteProduct(product._id!)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delist
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                            </div>
                          )}
                          <ProductCard 
                            product={product} 
                      onClick={() => setLocation(`/product/${product._id}`)} 
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-6">Start selling your items to see them here</p>
                      <Button onClick={() => setLocation('/sell')} className="bg-primary-500 hover:bg-primary-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                        List Your First Item
                      </Button>
                    </div>
                  )}
            </TabsContent>
            
          <TabsContent value="purchases" className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-800">My Purchases</h2>
              <p className="text-gray-600">Items you've bought from other sellers</p>
                  </div>

            {isLoadingTokenTransactions ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
            ) : tokenTransactions && tokenTransactions.length > 0 ? (
                    <div className="space-y-4">
                {tokenTransactions
                  .filter(t => t.type === 'purchase')
                  .map((transaction) => (
                    <div key={transaction._id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">Purchase</p>
                            <p className="text-sm text-gray-500">{formatDate(new Date(transaction.createdAt))}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">{formatTokens(Math.abs(transaction.amount))}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No purchases yet</h3>
                <p className="text-gray-500 mb-6">Items you buy will appear here</p>
                <Button onClick={() => setLocation('/marketplace')} variant="outline">
                  Browse Marketplace
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
                      <div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Transaction History</h2>
              <p className="text-gray-600">Complete history of your buying and selling activity</p>
            </div>

            {isLoadingTokenTransactions ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                            </div>
                          </div>
                ))}
                            </div>
            ) : tokenTransactions && tokenTransactions.length > 0 ? (
              <div className="space-y-4">
                {tokenTransactions.map((transaction) => (
                  <div key={transaction._id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {transaction.type === 'sale' ? (
                            <ArrowUpRight className="h-6 w-6 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-6 w-6 text-blue-500" />
                          )}
                          </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {transaction.type === 'sale' ? 'Sale' : 
                             transaction.type === 'purchase' ? 'Purchase' :
                             transaction.type === 'reward' ? 'Reward' : 'Load'}
                          </p>
                          <p className="text-sm text-gray-500">{formatDate(new Date(transaction.createdAt))}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">{formatTokens(Math.abs(transaction.amount))}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status}
                        </span>
                          </div>
                        </div>
                      </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
                <p className="text-gray-500">Your buying and selling activity will appear here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Profile Settings</h2>
              <p className="text-gray-600">Manage your account and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Your basic account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={currentUser.photoURL || undefined} />
                      <AvatarFallback className="text-lg">
                        {getInitials(currentUser.displayName || currentUser.email || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{currentUser.displayName || 'User'}</h3>
                      <p className="text-gray-600">{currentUser.email}</p>
                      <p className="text-sm text-gray-500">Member since {formatDate(new Date())}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Privacy Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="mr-2 h-4 w-4" />
                    View Reviews
                  </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the details of your product.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (tokens)
              </Label>
              <Input
                type="number"
                id="price"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select onValueChange={(value) => setEditFormData({ ...editFormData, category: value })} defaultValue={editFormData.category}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                                 <SelectContent>
                   <SelectItem value="books">Books</SelectItem>
                   <SelectItem value="electronics">Electronics</SelectItem>
                   <SelectItem value="clothes">Clothes</SelectItem>
                   <SelectItem value="stationery">Stationery</SelectItem>
                   <SelectItem value="misc">Miscellaneous</SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={editFormData.imageUrl}
                onChange={(e) => setEditFormData({ ...editFormData, imageUrl: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard;
