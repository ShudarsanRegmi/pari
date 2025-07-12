import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Leaf, TrendingUp, TrendingDown, History, Plus, Gift, Recycle } from 'lucide-react';
import { Link } from 'wouter';

interface TokenBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

interface TokenTransaction {
  _id: string;
  type: 'purchase' | 'sale' | 'reward' | 'donation' | 'recycling' | 'refund';
  amount: number;
  description: string;
  productId?: string;
  sellerId?: string;
  buyerId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
}

const Tokens = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.mongoUser?._id;

  const { data: balance, isLoading: balanceLoading } = useQuery<TokenBalance>({
    queryKey: [`/api/tokens/balance/${userId}`],
    enabled: !!userId,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery<TokenTransaction[]>({
    queryKey: [`/api/tokens/transactions/${userId}`],
    enabled: !!userId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'sale':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'reward':
        return <Gift className="h-4 w-4 text-blue-500" />;
      case 'donation':
        return <Recycle className="h-4 w-4 text-purple-500" />;
      case 'recycling':
        return <Recycle className="h-4 w-4 text-green-500" />;
      default:
        return <Leaf className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'sale':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'reward':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'donation':
      case 'recycling':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your tokens</h1>
          <p className="text-gray-600">You need to be logged in to access your token balance and transaction history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Green Tokens</h1>
          <p className="text-gray-600">Manage your green tokens and view your transaction history</p>
        </div>

        {/* Token Balance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Leaf className="h-5 w-5 mr-2 text-green-600" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold text-green-600">
                  {balance?.balance.toLocaleString() || 0}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">Available tokens</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold text-blue-600">
                  {balance?.totalEarned.toLocaleString() || 0}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              {balanceLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold text-red-600">
                  {balance?.totalSpent.toLocaleString() || 0}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">Lifetime spending</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Earn more tokens through green practices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
                <div className="flex items-center mb-2">
                  <Recycle className="h-5 w-5 mr-2 text-green-600" />
                  <span className="font-medium">Recycle Items</span>
                </div>
                <p className="text-sm text-gray-600 text-left">Donate old items and earn tokens</p>
              </Button>
              
              <Link href="/load-tokens">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-start w-full">
                  <div className="flex items-center mb-2">
                    <Plus className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-medium">Load Tokens</span>
                  </div>
                  <p className="text-sm text-gray-600 text-left">Add tokens to your balance</p>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </CardTitle>
            <CardDescription>Your recent token transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-gray-800">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTransactionColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                      <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount} tokens
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No transactions yet</h3>
                <p className="text-gray-500">Start buying and selling items to see your transaction history here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tokens; 