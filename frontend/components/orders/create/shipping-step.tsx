'use client';

/**
 * Shipping & Payment Step
 * 
 * Allows entering shipping address, selecting shipping method,
 * and choosing payment options for the order
 */

import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, MapPin, LucideHome, CreditCardIcon, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Props for the ShippingStep component
interface ShippingStepProps {
  initialData: {
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
  };
  customerData: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    isNew?: boolean;
  } | null;
  onComplete: (data: {
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
    };
    payment: {
      method: string;
      status: 'pending' | 'paid';
    };
    notes?: string;
  }) => void;
}

// Shipping methods with costs
const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', cost: 5.99, days: '5-7' },
  { id: 'express', name: 'Express Shipping', cost: 14.99, days: '2-3' },
  { id: 'overnight', name: 'Overnight Shipping', cost: 29.99, days: '1' },
];

// Payment methods
const paymentMethods = [
  { id: 'credit', name: 'Credit Card', icon: <CreditCard className="h-4 w-4 mr-2" /> },
  { id: 'paypal', name: 'PayPal', icon: <Wallet className="h-4 w-4 mr-2" /> },
  { id: 'invoice', name: 'Invoice', icon: <CreditCardIcon className="h-4 w-4 mr-2" /> },
];

// US States for dropdown
const usStates = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  // ... add other states as needed
  { value: 'NY', label: 'New York' },
  { value: 'TX', label: 'Texas' },
  { value: 'WA', label: 'Washington' },
];

// Countries for dropdown
const countries = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
  { value: 'UK', label: 'United Kingdom' },
];

/**
 * Format price to currency format
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * ShippingStep Component
 * 
 * Provides UI for entering shipping and payment information
 */
export function ShippingStep({ initialData, customerData, onComplete }: ShippingStepProps) {
  // Default empty address
  const emptyAddress = {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
  };
  
  // Initialize state from initialData or with defaults
  const [shippingAddress, setShippingAddress] = useState(
    initialData.shipping?.address || emptyAddress
  );
  
  const [shippingMethod, setShippingMethod] = useState(
    initialData.shipping?.method || 'standard'
  );
  
  const [paymentMethod, setPaymentMethod] = useState(
    initialData.payment?.method || 'credit'
  );
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>(
    initialData.payment?.status || 'pending'
  );
  
  const [orderNotes, setOrderNotes] = useState(
    initialData.notes || ''
  );
  
  // Current tab for shipping/payment
  const [activeTab, setActiveTab] = useState('shipping');
  
  // Track form validity
  const [isShippingValid, setIsShippingValid] = useState(false);
  const [isPaymentValid, setIsPaymentValid] = useState(false);
  
  // Get shipping cost based on selected method
  const shippingCost = shippingMethods.find(m => m.id === shippingMethod)?.cost || 0;
  
  /**
   * Validate shipping information
   */
  useEffect(() => {
    const { street, city, state, postal_code, country } = shippingAddress;
    
    const isValid = Boolean(
      street.trim() !== '' &&
      city.trim() !== '' &&
      state.trim() !== '' &&
      postal_code.trim() !== '' &&
      country.trim() !== '' &&
      shippingMethod
    );
    
    setIsShippingValid(isValid);
  }, [shippingAddress, shippingMethod]);
  
  /**
   * Validate payment information
   */
  useEffect(() => {
    setIsPaymentValid(Boolean(paymentMethod));
  }, [paymentMethod]);
  
  /**
   * Complete this step when both shipping and payment are valid
   */
  useEffect(() => {
    if (isShippingValid && isPaymentValid) {
      onComplete({
        shipping: {
          address: shippingAddress,
          method: shippingMethod,
          cost: shippingCost,
        },
        payment: {
          method: paymentMethod,
          status: paymentStatus,
        },
        notes: orderNotes,
      });
    }
  }, [isShippingValid, isPaymentValid, shippingAddress, shippingMethod, shippingCost, paymentMethod, paymentStatus, orderNotes, onComplete]);
  
  /**
   * Handle shipping address field changes
   */
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  /**
   * Handle shipping method selection
   */
  const handleShippingMethodChange = (value: string) => {
    setShippingMethod(value);
  };
  
  /**
   * Handle payment method selection
   */
  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="shipping" className="flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>
        
        {/* Shipping Tab */}
        <TabsContent value="shipping" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    name="street"
                    placeholder="123 Main St"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      placeholder="City"
                      value={shippingAddress.city}
                      onChange={handleAddressChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      name="state"
                      value={shippingAddress.state}
                      onValueChange={(value) => 
                        handleAddressChange({ target: { name: 'state', value } } as any)
                      }
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {usStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                      id="postal_code"
                      name="postal_code"
                      placeholder="ZIP/Postal Code"
                      value={shippingAddress.postal_code}
                      onChange={handleAddressChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select
                      name="country"
                      value={shippingAddress.country}
                      onValueChange={(value) => 
                        handleAddressChange({ target: { name: 'country', value } } as any)
                      }
                    >
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Shipping Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={shippingMethod}
                onValueChange={handleShippingMethodChange}
                className="flex flex-col space-y-3"
              >
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={`shipping-${method.id}`} />
                    <Label
                      htmlFor={`shipping-${method.id}`}
                      className="flex flex-1 items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Delivery in {method.days} business days
                        </div>
                      </div>
                      <div className="font-semibold">
                        {formatCurrency(method.cost)}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
          
          {/* Form validation status */}
          <div className="text-sm">
            {isShippingValid ? (
              <span className="text-green-500 flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Shipping information complete
              </span>
            ) : (
              <span className="text-muted-foreground">
                Please fill in all required shipping information
              </span>
            )}
          </div>
          
          {/* Next button */}
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={() => setActiveTab('payment')}
              disabled={!isShippingValid}
            >
              Continue to Payment
              <CreditCard className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={handlePaymentMethodChange}
                className="flex flex-col space-y-3"
              >
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={`payment-${method.id}`} />
                    <Label
                      htmlFor={`payment-${method.id}`}
                      className="flex items-center cursor-pointer"
                    >
                      {method.icon}
                      <span>{method.name}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <div className="mt-4 p-3 bg-muted rounded-md">
                <div className="flex items-center">
                  <Label htmlFor="payment-status" className="mr-4">Payment Status:</Label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(value) => 
                      setPaymentStatus(value as 'pending' | 'paid')
                    }
                  >
                    <SelectTrigger id="payment-status" className="w-32">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For demonstration purposes only. In a real system, this would be handled by payment processing.
                </p>
              </div>
              
              <div className="mt-6 space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any special instructions or notes about this order"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Form validation status */}
          <div className="text-sm">
            {isPaymentValid ? (
              <span className="text-green-500 flex items-center">
                <Check className="mr-1 h-4 w-4" />
                Payment information complete
              </span>
            ) : (
              <span className="text-muted-foreground">
                Please select a payment method
              </span>
            )}
          </div>
          
          {/* Back button */}
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setActiveTab('shipping')}
            >
              <Truck className="mr-2 h-4 w-4" />
              Back to Shipping
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 