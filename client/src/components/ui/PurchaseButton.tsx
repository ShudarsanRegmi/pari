import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Leaf, ShoppingCart, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PurchaseButtonProps {
  product: {
    _id: string;
    title: string;
    price: number;
    sellerId: string;
    isSold: boolean;
  };
}

const PurchaseButton = ({ product }: PurchaseButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tokens/purchase', {
        productId: product._id,
        buyerId: currentUser?.mongoUser?._id,
        sellerId: product.sellerId,
        price: product.price
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: `You've successfully purchased ${product.title} for ${product.price} green tokens.`,
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: [`/api/tokens/balance/${currentUser?.mongoUser?._id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/tokens/transactions/${currentUser?.mongoUser?._id}`] });
      
      setIsOpen(false);
    },
    onError: (error: any) => {
      const message = error?.message || 'Purchase failed. Please try again.';
      toast({
        title: "Purchase Failed",
        description: message,
        variant: "destructive",
      });
    }
  });

  const handlePurchase = async () => {
    if (!currentUser?.mongoUser?._id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase this item.",
        variant: "destructive",
      });
      return;
    }

    if (currentUser.mongoUser._id === product.sellerId) {
      toast({
        title: "Cannot Purchase",
        description: "You cannot purchase your own item.",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    purchaseMutation.mutate();
  };

  if (product.isSold) {
    return (
      <Button disabled variant="outline" className="w-full">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Sold
      </Button>
    );
  }

  if (currentUser?.mongoUser?._id === product.sellerId) {
    return (
      <Button disabled variant="outline" className="w-full">
        <ShoppingCart className="mr-2 h-4 w-4" />
        Your Item
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-green-600 hover:bg-green-700">
          <Leaf className="mr-2 h-4 w-4" />
          Buy with {product.price} Tokens
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Purchase</DialogTitle>
          <DialogDescription>
            Are you sure you want to purchase this item with green tokens?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Leaf className="h-5 w-5 text-green-600" />
            <span className="font-medium">{product.title}</span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price:</span>
              <span className="font-bold text-green-600">{product.price} Green Tokens</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>• This purchase will be final and cannot be refunded</p>
            <p>• The seller will receive the tokens immediately</p>
            <p>• The item will be marked as sold</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={purchaseMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={purchaseMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {purchaseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Leaf className="mr-2 h-4 w-4" />
                Confirm Purchase
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseButton; 