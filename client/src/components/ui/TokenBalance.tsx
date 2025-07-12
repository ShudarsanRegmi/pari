import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/useAuth';
import { Leaf, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TokenBalanceData {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

const TokenBalance = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.mongoUser?._id;

  const { data: balance, isLoading } = useQuery<TokenBalanceData>({
    queryKey: [`/api/tokens/balance/${userId}`],
    enabled: !!userId,
  });

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-24 mb-2" />
          <div className="flex space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Leaf className="h-5 w-5 mr-2 text-green-600" />
          Green Tokens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600 mb-2">
          {balance.balance.toLocaleString()}
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>+{balance.totalEarned.toLocaleString()}</span>
          </div>
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
            <span>-{balance.totalSpent.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance; 