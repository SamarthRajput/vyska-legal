import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Mail } from 'lucide-react';

const HelpPage = () => {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full bg-blue-50/30 border-none">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Need help?
          </CardTitle>
          <p className="text-base sm:text-lg text-gray-600">
            We're here to assist—Check out these support options
          </p>
        </CardHeader>
        
        <CardContent className="pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* WhatsApp Support */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-gray-300">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
                  Message us on whatsApp
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Get instant replies, get information anytime
                </p>
                
                <a href="https://wa.me/1234567890">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto px-6 py-2 border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                      Chat now
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Customer Support */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-gray-300">
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
                  Customer support
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Connect directly with our team for quick help
                </p>
                
                <a href="">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto px-6 py-2 border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    Call now
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow duration-200 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 text-center relative">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full border-2 border-gray-300">
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">
                  Reach us on mail
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
                  Send us your feedback or detailed queries
                </p>
                
                <a href="mailto:service@vyskalegal.com">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto px-6 py-2 border-gray-300 hover:bg-gray-50 cursor-pointer"
                  >
                    Send mail
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;