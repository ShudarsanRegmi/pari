import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { FaHandshake, FaLeaf, FaRecycle, FaWallet } from 'react-icons/fa';
import { Link } from 'wouter';

const About = () => {
  const faqs = [
    {
      question: "How much does it cost to list an item?",
      answer: "It's completely free to list items on Parivartana."
    },
    {
      question: "How much does it cost to contact a seller?",
      answer: "Contacting sellers is completely free for all users."
    },
    {
      question: "How do I meet with buyers/sellers?",
      answer: "We recommend meeting in public places on campus during daylight hours. Popular spots include the campus cafeteria, library entrance, or student center."
    },
    {
      question: "What if the item is not as described?",
      answer: "We encourage buyers to inspect items thoroughly before paying. If there are serious issues, report them to our team, and we'll help mediate the situation."
    },
    {
      question: "Can I list any type of item?",
      answer: "We allow books, electronics, clothes, stationery, and miscellaneous items. However, prohibited items include: illegal goods, weapons, alcohol, tobacco, prescription drugs, and perishable food."
    },
    {
      question: "How long will my listing stay active?",
      answer: "Listings remain active for 60 days. After that, you can easily relist the item for free if it hasn't sold yet."
    }
  ];

  return (
    <>
      <Helmet>
        <title>How It Works | Parivartana</title>
        <meta name="description" content="Learn about Parivartana - the sustainable student marketplace helping campus communities buy, sell, and exchange items responsibly." />
      </Helmet>

      <div>
        {/* Hero section */}
        <div className="bg-primary-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-display font-bold mb-4">About Parivartana</h1>
            <p className="text-xl max-w-2xl mx-auto">
              A student-led initiative to make campus life more sustainable and affordable.
            </p>
          </div>
        </div>

        {/* Mission section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600">
                Parivartana aims to create a circular economy within student communities,
                reducing waste while making essentials more accessible and affordable.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 text-2xl mx-auto mb-4">
                    <FaRecycle />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sustainability</h3>
                  <p className="text-gray-600">
                    Extending the lifecycle of products reduces waste and lowers our carbon footprint.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center text-accent-500 text-2xl mx-auto mb-4">
                    <FaWallet />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Affordability</h3>
                  <p className="text-gray-600">
                    Students save money on essentials and earn from items they no longer need.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-500 text-2xl mx-auto mb-4">
                    <FaHandshake />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-gray-600">
                    Building connections between students while promoting responsible consumption.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">How Parivartana Works</h2>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[15px] md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-primary-200 hidden md:block"></div>

                {/* Timeline items */}
                <div className="space-y-12">
                  {/* For sellers */}
                  <div className="relative">
                    <h3 className="text-2xl font-display font-semibold text-center mb-8 bg-white inline-block px-4 relative z-10 mx-auto md:shadow-sm md:rounded">For Sellers</h3>
                    
                    <div className="md:grid md:grid-cols-2 md:gap-12">
                      <div className="mb-8 md:mb-0 flex md:block">
                        <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center md:mx-auto md:mb-4 mr-4 md:mr-0 flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-1">List Your Item</h4>
                          <p className="text-gray-600">Take clear photos and provide an honest description. Completely free!</p>
                        </div>
                      </div>
                      
                      <div className="flex md:block">
                        <div className="bg-primary-500 text-white rounded-full w-8 h-8 flex items-center justify-center md:mx-auto md:mb-4 mr-4 md:mr-0 flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-1">Get Paid</h4>
                          <p className="text-gray-600">Meet the buyer on campus, complete the sale, and receive the full amount.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* For buyers */}
                  <div className="relative">
                    <h3 className="text-2xl font-display font-semibold text-center mb-8 bg-white inline-block px-4 relative z-10 mx-auto md:shadow-sm md:rounded">For Buyers</h3>
                    
                    <div className="md:grid md:grid-cols-2 md:gap-12">
                      <div className="mb-8 md:mb-0 flex md:block">
                        <div className="bg-secondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center md:mx-auto md:mb-4 mr-4 md:mr-0 flex-shrink-0">
                          1
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-1">Browse Items</h4>
                          <p className="text-gray-600">Explore items by category. Find great deals on books, electronics, clothes, and more.</p>
                        </div>
                      </div>
                      
                      <div className="flex md:block">
                        <div className="bg-secondary-500 text-white rounded-full w-8 h-8 flex items-center justify-center md:mx-auto md:mb-4 mr-4 md:mr-0 flex-shrink-0">
                          2
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold mb-1">Contact Seller</h4>
                          <p className="text-gray-600">Contact the seller for free and arrange a meeting on campus.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Platform features section */}
        <section className="py-16 bg-white" id="features">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-display font-bold text-center mb-8">100% Free Platform</h2>
              <p className="text-center text-gray-600 mb-12">
                Parivartana is completely free to use for all students. No hidden costs, ever.
              </p>

              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm mb-8">
                <div className="md:grid md:grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center text-primary-700">
                      <span className="bg-primary-100 p-2 rounded-full mr-2">
                        <FaLeaf className="text-primary-500" />
                      </span>
                      Everything Is Free
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        <span>List unlimited items</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        <span>60-day listing duration</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        <span>Full search functionality</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        <span>Messaging system to contact sellers</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary-500 mr-2">•</span>
                        <span>No commissions or hidden fees</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-600 text-sm">
                Parivartana is maintained and supported by student volunteers who believe in a sustainable campus community.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-16 bg-gray-50" id="faq">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Contact section */}
        <section className="py-16 bg-white" id="contact">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-display font-bold mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                Have a question or suggestion? We'd love to hear from you!
              </p>
              
              <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
                <p className="font-medium text-gray-800 mb-4">Contact Information</p>
                <div className="space-y-2 mb-6">
                  <p className="text-gray-600">Email: <a href="mailto:hello@parivartana.org" className="text-primary-500 hover:underline">hello@parivartana.org</a></p>
                  <p className="text-gray-600">Mobile: +91 98765 43210</p>
                </div>
                
                <Separator className="my-6" />
                
                <p className="font-medium text-gray-800 mb-4">Follow Us</p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="text-gray-400 hover:text-primary-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-primary-500">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="bg-primary-500 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to Join the Community?</h2>
            <p className="text-white text-opacity-90 max-w-2xl mx-auto mb-8">
              Start buying and selling with your campus community today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-gray-800 shadow-lg">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="bg-white text-primary-600 hover:bg-gray-100 border-none shadow-lg">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;