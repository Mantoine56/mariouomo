'use client';

/**
 * Order Creation Page
 * 
 * A multi-step form for creating new orders in the admin dashboard
 * Includes customer selection, product selection, shipping/payment options, and order review
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ShoppingCart, User, Truck, CreditCard, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Step components will be imported from separate files
import { CustomerStep } from '@/components/orders/create/customer-step';
import { ProductsStep } from '@/components/orders/create/products-step';
import { ShippingStep } from '@/components/orders/create/shipping-step';
import { ReviewStep } from '@/components/orders/create/review-step';

// Define the steps in the order creation process
const STEPS = [
  { id: 'customer', label: 'Customer Details', icon: <User className="mr-2 h-4 w-4" /> },
  { id: 'products', label: 'Products', icon: <ShoppingCart className="mr-2 h-4 w-4" /> },
  { id: 'shipping', label: 'Shipping & Payment', icon: <Truck className="mr-2 h-4 w-4" /> },
  { id: 'review', label: 'Review & Submit', icon: <Check className="mr-2 h-4 w-4" /> },
];

/**
 * Order data type for tracking state throughout the form
 */
export type OrderFormData = {
  customer: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    isNew?: boolean;
  } | null;
  products: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  shipping: {
    address: {
      street: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    method: string;
    cost: number;
  } | null;
  payment: {
    method: string;
    status: 'pending' | 'paid';
  } | null;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
};

/**
 * Calculate order totals based on selected products, shipping, and tax
 */
const calculateOrderTotals = (products: OrderFormData['products'], shippingCost: number = 0): { subtotal: number, tax: number, total: number } => {
  const subtotal = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  // Calculate tax (assuming 8% for now)
  const tax = subtotal * 0.08;
  return {
    subtotal,
    tax,
    total: subtotal + tax + shippingCost
  };
};

/**
 * Initial empty order form data
 */
const initialOrderData: OrderFormData = {
  customer: null,
  products: [],
  shipping: null,
  payment: null,
  subtotal: 0,
  tax: 0,
  total: 0
};

/**
 * Order Creation Page Component
 */
export default function CreateOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Track the current step in the form process
  const [currentStep, setCurrentStep] = useState(0);
  
  // Order data state
  const [orderData, setOrderData] = useState<OrderFormData>(initialOrderData);
  
  // Loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track whether each step has been completed
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    customer: false,
    products: false,
    shipping: false,
    review: false,
  });

  /**
   * Update order data from a step
   */
  const updateOrderData = (stepId: string, data: Partial<OrderFormData>) => {
    setOrderData(prev => {
      const updatedData = { ...prev, ...data };
      
      // Recalculate totals if products or shipping changed
      if (data.products || (data.shipping && 'cost' in data.shipping)) {
        const shippingCost = updatedData.shipping?.cost || 0;
        const totals = calculateOrderTotals(updatedData.products, shippingCost);
        updatedData.subtotal = totals.subtotal;
        updatedData.tax = totals.tax;
        updatedData.total = totals.total;
      }
      
      return updatedData;
    });
    
    // Mark the step as completed
    setCompletedSteps(prev => ({ ...prev, [stepId]: true }));
  };

  /**
   * Move to the next step in the form
   */
  const handleNext = () => {
    // Validate current step before moving forward
    const currentStepId = STEPS[currentStep].id;
    
    if (!completedSteps[currentStepId]) {
      toast({
        title: "Please complete the current step",
        description: `You need to fill out all required fields in the ${STEPS[currentStep].label} section.`,
        variant: "destructive",
      });
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  /**
   * Move to the previous step in the form
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Submit the complete order
   */
  const handleSubmitOrder = () => {
    // Validate order data before submission
    if (!orderData.customer || orderData.products.length === 0 || !orderData.shipping || !orderData.payment) {
      toast({
        title: "Incomplete order",
        description: "Please complete all steps before submitting the order.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call to create order
    setTimeout(() => {
      // In a real app, this would be an API call
      
      toast({
        title: "Order created",
        description: "The order has been created successfully.",
        variant: "success",
      });
      
      setIsSubmitting(false);
      
      // Redirect to the order detail page (using a placeholder ID)
      router.push('/dashboard/orders/ORD-' + Math.floor(Math.random() * 10000));
    }, 1500);
  };

  /**
   * Render the current step content
   */
  const renderStepContent = () => {
    const stepId = STEPS[currentStep].id;
    
    switch (stepId) {
      case 'customer':
        return (
          <CustomerStep 
            initialData={orderData.customer}
            onComplete={(data) => updateOrderData('customer', { customer: data })}
          />
        );
      
      case 'products':
        return (
          <ProductsStep 
            initialData={orderData.products}
            onComplete={(products) => updateOrderData('products', { products })}
          />
        );
      
      case 'shipping':
        return (
          <ShippingStep 
            initialData={{ shipping: orderData.shipping, payment: orderData.payment, notes: orderData.notes }}
            customerData={orderData.customer}
            onComplete={(data) => updateOrderData('shipping', data)}
          />
        );
      
      case 'review':
        return (
          <ReviewStep 
            orderData={orderData}
            onComplete={() => updateOrderData('review', {})}
          />
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-6 p-8 pt-6">
        {/* Header */}
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 p-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to orders
          </Button>
          <Heading title="Create New Order" description="Create a new order in the system" />
        </div>
        
        <Separator />
        
        {/* Step indicator */}
        <div className="w-full">
          <nav aria-label="Progress">
            <ol className="flex space-x-4 md:space-x-8">
              {STEPS.map((step, index) => (
                <li key={step.id} className="flex-1">
                  <div className="flex flex-col md:flex-row items-center">
                    <div 
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                        currentStep > index
                          ? "bg-primary text-primary-foreground border-primary"
                          : currentStep === index
                          ? "border-primary text-primary"
                          : "border-muted-foreground text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="mt-1 md:mt-0 md:ml-2 text-xs md:text-sm font-medium hidden md:block">
                      {step.label}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        
        {/* Step content */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              {STEPS[currentStep].icon}
              {STEPS[currentStep].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button 
                onClick={handleSubmitOrder}
                disabled={isSubmitting || !completedSteps.review}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-t-2 border-solid rounded-full border-white animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    Create Order
                    <Check className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!completedSteps[STEPS[currentStep].id]}
              >
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {/* Warning about test mode */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">This is a test environment</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Orders created here will use mock data and won't process actual payments or inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 