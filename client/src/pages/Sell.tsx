import ProductForm from '@/components/sell/ProductForm';
import { useAuth } from '@/lib/useAuth';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'wouter';

const Sell = () => {
  const { currentUser, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Redirect to login if user is not authenticated and not in loading state
    if (!loading && !currentUser) {
      navigate('/login?redirect=/sell');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null; // This will trigger the redirect in useEffect
  }

  return (
    <>
      <Helmet>
        <title>List an Item | Parivartana</title>
        <meta name="description" content="List your unwanted items for sale on Parivartana - the sustainable student marketplace." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-gray-800">List an Item for Sale</h1>
            <p className="text-gray-600 mt-2">
              Turn your unused items into cash while helping other students find affordable essentials.
            </p>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 md:p-8">
            <div className="bg-primary-50 border border-primary-100 rounded-md p-4 mb-6">
              <h2 className="font-medium text-primary-800 text-lg mb-2">How Listing Works</h2>
              <ul className="space-y-2 text-primary-700 text-sm">
                <li className="flex items-start">
                  <span className="bg-primary-200 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">1</span>
                  <span>List your items completely free - no listing fees!</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-200 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">2</span>
                  <span>Add clear photos and honest descriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary-200 text-primary-700 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">3</span>
                  <span>Meet buyers safely on campus to complete the sale</span>
                </li>
              </ul>
            </div>

            <ProductForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Sell;