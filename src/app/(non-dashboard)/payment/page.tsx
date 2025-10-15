/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import {
    Check,
    Crown,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PricingPlan {
    id: string;
    name: string;
    price: number;
    duration: string;
    features: string[];
}

const PricingPage = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

    const pricingPlans: PricingPlan[] = [
        {
            id: 'basic',
            name: 'Basic',
            price: 499,
            duration: 'month',
            features: [
                'Up to 1000 shortened URLs',
                'Basic Analytics',
                'Standard Support',
                'Ad-free Experience'
            ]
        },
        {
            id: 'pro',
            name: 'Professional',
            price: 999,
            duration: 'month',
            features: [
                'Unlimited shortened URLs',
                'Advanced Analytics',
                'Priority Support',
                'Custom Domain Support',
                'API Access',
                'Team Collaboration'
            ]
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 1999,
            duration: 'month',
            features: [
                'Everything in Professional',
                'Dedicated Account Manager',
                'Custom Integration Support',
                'SLA Guarantee',
                'Enhanced Security Features',
                'Bulk URL Management'
            ]
        }
    ];

    const handlePayment = async (plan: PricingPlan) => {
        setSelectedPlan(plan);
        setIsProcessing(true);
        setPaymentError("");

        try {
            const res = await fetch("/api/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    amount: plan.price,
                    paymentFor: "SERVICE",
                    serviceId: plan.id,
                    description: `Payment for ${plan.name} Plan`,   
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Order created successfully. Redirecting to payment gateway...");
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: data.amount,
                    currency: "INR",
                    name: "URL Shortener",
                    description: `Payment for ${plan.name} Plan`,
                    image: "/favicon.ico",
                    order_id: data.orderid,
                    handler: function (response: any) {
                        console.log(response);
                        console.log("Payment successful");
                        // Add success handling here
                    },
                    prefill: {
                        name: "URL Shortener",
                        email: "rohitkuyada@gmail.com",
                        contact: "6392177974",
                    },
                    notes: {
                        address: "URL Shortener",
                        plan: plan.name
                    },
                    theme: {
                        color: "#2563EB",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                setPaymentError(`An error occurred: ${data.message}`);
                toast.error("Payment Error", {
                    description: data.message
                });
            }
        } catch (error) {
            setPaymentError("An error occurred. Please try again later.");
        }

        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Choose Your Premium Plan</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Upgrade to premium and unlock powerful features to manage your shortened URLs more effectively.
                    </p>
                </div>

                {/* Pricing Plans */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {pricingPlans.map((plan) => (
                        <Card key={plan.id} className={`relative ${plan.id === 'pro' ? 'border-blue-200 shadow-lg' : ''
                            }`}>
                            {plan.id === 'pro' && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <Badge variant="default" className="bg-blue-500">
                                        Most Popular
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {plan.name}
                                    {plan.id === 'enterprise' && <Crown className="w-5 h-5 text-yellow-500" />}
                                </CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold">₹{plan.price}</span>
                                    <span className="text-gray-600">/{plan.duration}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-5 h-5 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="w-full mt-6"
                                    variant={plan.id === 'pro' ? 'default' : 'outline'}
                                    onClick={() => handlePayment(plan)}
                                    disabled={isProcessing && selectedPlan?.id === plan.id}
                                >
                                    {isProcessing && selectedPlan?.id === plan.id ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing
                                        </>
                                    ) : (
                                        'Upgrade Now'
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Error Message */}
                {paymentError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>{paymentError}</AlertDescription>
                    </Alert>
                )}

                {/* Features Section */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-center mb-8">Why Choose Premium?</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                                <p className="text-gray-600">
                                    Get detailed insights about your links including geographic data, device info, and click patterns.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Custom Domains</h3>
                                <p className="text-gray-600">
                                    Use your own domain name for shortened URLs to maintain brand consistency.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-6">
                                <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
                                <p className="text-gray-600">
                                    Get faster responses and dedicated support for all your questions and concerns.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </div>
    );
};

export default PricingPage;