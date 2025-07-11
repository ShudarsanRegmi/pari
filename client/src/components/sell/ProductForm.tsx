import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/useAuth";
import { usePayment } from "@/lib/usePayment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  price: z.number().min(1, { message: "Price must be at least ₹1" }),
  category: z.string(),
  condition: z.string(),
  image: z.instanceof(FileList).optional().refine(
    (files) => !files || files.length === 0 || (files.length === 1 && files[0].size <= 5 * 1024 * 1024),
    {
      message: "The image must be less than 5MB",
    }
  ),
});

const ProductForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedProduct, setSubmittedProduct] = useState(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { processListingFee, isLoading: isPaymentLoading } = usePayment();
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "books",
      condition: "good",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const onSubmit = async (data) => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to list an item",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Handle image (simplified for demo)
      let imageUrl = imagePreview;

      // Create the product
      const productData = {
        title: data.title,
        description: data.description,
        price: Math.round(data.price * 100), // Convert to paisa
        category: data.category,
        condition: data.condition,
        imageUrl: imageUrl || null,
        sellerId: currentUser?.id || 1, // Use actual user ID
      };

      const response = await apiRequest("POST", "/api/products", productData);
      const product = await response.json();
      
      if (product && product.id) {
        // Process the listing fee
        const paymentResult = await processListingFee(product.id, {
          amount: 2000, // ₹20 in paisa
          description: "Listing fee for " + data.title,
          metadata: {
            productId: product.id,
            sellerId: currentUser?.id || 1,
          },
        });

        if (paymentResult) {
          // Store product data for success message
          setSubmittedProduct(product);
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: ['/api/products'] });
          queryClient.invalidateQueries({ queryKey: [`/api/products?sellerId=${currentUser?.id || 1}`] });
          
          // Show success message
          setShowSuccess(true);
          
          // Show toast notification
          toast({
            title: "Product Listed Successfully!",
            description: "Your item has been listed on the marketplace.",
          });
          
          // Reset form
          form.reset();
          setImagePreview(null);
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            setLocation("/dashboard?tab=listings");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Error during product listing:", error);
      toast({
        title: "Listing Failed",
        description: "There was an error listing your product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess && submittedProduct) {
    return (
      <div className="space-y-6">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-lg font-medium">Item Listed Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <p className="mt-2">Your item "{submittedProduct.title}" has been added to the marketplace.</p>
            <p className="mt-1">You will be redirected to your profile page in a moment...</p>
          </AlertDescription>
        </Alert>
        
        <div className="border rounded-lg p-4 bg-white">
          <h3 className="font-medium text-lg mb-2">Product Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Title</p>
              <p className="font-medium">{submittedProduct.title}</p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">₹{(submittedProduct.price / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium capitalize">{submittedProduct.category}</p>
            </div>
            <div>
              <p className="text-gray-500">Condition</p>
              <p className="font-medium capitalize">{submittedProduct.condition.replace('_', ' ')}</p>
            </div>
          </div>
          
          {submittedProduct.imageUrl && (
            <div className="mt-4">
              <p className="text-gray-500 text-sm mb-1">Product Image</p>
              <img 
                src={submittedProduct.imageUrl} 
                alt={submittedProduct.title} 
                className="w-32 h-32 object-cover rounded-md border" 
              />
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowSuccess(false);
              setSubmittedProduct(null);
            }}
          >
            List Another Item
          </Button>
          <Button onClick={() => setLocation("/dashboard?tab=listings")}>
            Go to My Listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Calculus Textbook (8th Edition)" {...field} />
              </FormControl>
              <FormDescription>
                Be descriptive to help buyers find your item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1000" 
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormDescription>
                  Set a competitive price to sell faster.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="clothes">Clothes</SelectItem>
                    <SelectItem value="stationery">Stationery</SelectItem>
                    <SelectItem value="misc">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the most appropriate category.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like_new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Be honest about the condition of your item.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your item in detail. Include any defects or special features." 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                The more details you provide, the more likely someone will buy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      onChange(e.target.files);
                      handleImageChange(e);
                    }}
                    {...fieldProps}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 mb-2">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-w-md h-auto rounded-md border border-gray-300" 
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload a clear image of your item (max 5MB).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        

        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {(isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          List Item
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;