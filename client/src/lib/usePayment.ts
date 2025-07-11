import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { apiRequest } from './queryClient';
import { useAuth } from './useAuth';

export function usePayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const processListingFee = async (productId: number, options: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list an item",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      // Skip payment processing - just show success
      toast({
        title: "Item Listed Successfully",
        description: "Your item has been listed without any fees.",
      });
      
      // Return a mock successful transaction
      return { success: true, id: `listing_${Date.now()}` };
    } catch (error) {
      console.error('Listing error:', error);
      toast({
        title: "Listing Failed",
        description: "Could not list your item. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const processContactFee = async (productId: number, sellerId: number, options: any) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to contact the seller",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsLoading(true);
      
      // Grant contact access directly without payment
      await apiRequest('POST', '/api/contact-access', {
        productId,
        buyerId: options.metadata?.buyerId,
      });
      
      toast({
        title: "Access Granted",
        description: "You can now contact the seller for free.",
      });
      
      return { hasAccess: true };
    } catch (error) {
      console.error('Contact access error:', error);
      toast({
        title: "Access Failed",
        description: "Could not grant contact access. Please try again.",
        variant: "destructive"
      });
      return { hasAccess: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    processListingFee,
    processContactFee
  };
}