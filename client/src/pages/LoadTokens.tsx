import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Leaf, CreditCard, Smartphone, QrCode, Loader2 } from 'lucide-react';

const LoadTokens = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'qr'>('upi');
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loadTokensMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tokens/reward', {
        userId: currentUser?.mongoUser?._id,
        amount: parseInt(amount),
        reason: `Token load via ${paymentMethod}`
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Tokens Loaded Successfully!",
        description: `${amount} tokens have been added to your balance.`,
      });
      
      // Invalidate token balance queries
      queryClient.invalidateQueries({ queryKey: [`/api/tokens/balance/${currentUser?.mongoUser?._id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tokens/transactions/${currentUser?.mongoUser?._id}`] });
      
      setAmount('');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to load tokens. Please try again.';
      toast({
        title: "Token Load Failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseInt(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of tokens to load.",
        variant: "destructive",
      });
      return;
    }

    loadTokensMutation.mutate();
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please log in to load tokens</h1>
          <p className="text-gray-600">You need to be logged in to add tokens to your balance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Load Green Tokens</h1>
          <p className="text-gray-600">Add tokens to your balance to buy items and support green practices</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              Add Tokens to Your Balance
            </CardTitle>
            <CardDescription>
              Choose your preferred payment method and amount
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Tokens)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount (e.g., 500)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  required
                />
                <p className="text-sm text-gray-500">
                  Minimum: 1 token | Recommended: 100-1000 tokens
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    type="button"
                    variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <Smartphone className="h-6 w-6 mb-2" />
                    <span className="font-medium">UPI</span>
                    <span className="text-xs text-gray-500">Google Pay, PhonePe</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span className="font-medium">Card</span>
                    <span className="text-xs text-gray-500">Credit/Debit Card</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant={paymentMethod === 'qr' ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-center"
                    onClick={() => setPaymentMethod('qr')}
                  >
                    <QrCode className="h-6 w-6 mb-2" />
                    <span className="font-medium">QR Code</span>
                    <span className="text-xs text-gray-500">Scan & Pay</span>
                  </Button>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tokens to load:</span>
                    <span className="font-medium">{amount || 0} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment method:</span>
                    <span className="font-medium capitalize">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing fee:</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">{amount || 0} tokens</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loadTokensMutation.isPending || !amount}
              >
                {loadTokensMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Leaf className="mr-2 h-4 w-4" />
                    Load {amount || 0} Tokens
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Token Loading Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Choose Amount</h4>
                <p className="text-sm text-gray-600">Select how many green tokens you want to add to your balance.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Select Payment Method</h4>
                <p className="text-sm text-gray-600">Choose from UPI, card, or QR code payment options.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-green-600 text-sm font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Complete Payment</h4>
                <p className="text-sm text-gray-600">Tokens will be instantly added to your balance after successful payment.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoadTokens; 