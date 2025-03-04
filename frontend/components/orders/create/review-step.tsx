'use client';

/**
 * Review Step
 * 
 * Displays a summary of the order for review before submission
 * Shows customer details, product list, shipping and payment information
 */

import React, { useEffect, useState } from 'react';
import { Check, ShoppingCart, User, Truck, CreditCard, AlertCircle, MapPin, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OrderFormData } from '@/app/dashboard/orders/create/page';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Props for the ReviewStep component
interface ReviewStepProps {
  orderData: OrderFormData;
  onComplete: () => void;
}

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
 * ReviewStep Component
 * 
 * Provides UI for reviewing order details before submission
 */
export function ReviewStep({ orderData, onComplete }: ReviewStepProps) {
  // Check if all necessary data is present
  const [isComplete, setIsComplete] = useState(false);
  
  // Determine if review is ready and complete this step if so
  useEffect(() => {
    const hasCustomer = !!orderData.customer;
    const hasProducts = orderData.products.length > 0;
    const hasShipping = !!orderData.shipping;
    const hasPayment = !!orderData.payment;
    
    const isReviewReady = hasCustomer && hasProducts && hasShipping && hasPayment;
    setIsComplete(isReviewReady);
    
    if (isReviewReady) {
      onComplete();
    }
  }, [orderData, onComplete]);
  
  // Format country code to country name
  const getCountryName = (code: string): string => {
    const countries: Record<string, string> = {
      'US': 'United States',
      'CA': 'Canada',
      'MX': 'Mexico',
      'UK': 'United Kingdom',
    };
    return countries[code] || code;
  };
  
  // Format state code to state name
  const getStateName = (code: string): string => {
    const states: Record<string, string> = {
      'AL': 'Alabama',
      'AK': 'Alaska',
      'AZ': 'Arizona',
      'AR': 'Arkansas',
      'CA': 'California',
      'CO': 'Colorado',
      'CT': 'Connecticut',
      'DE': 'Delaware',
      'FL': 'Florida',
      'GA': 'Georgia',
      'NY': 'New York',
      'TX': 'Texas',
      'WA': 'Washington',
      // Add other states as needed
    };
    return states[code] || code;
  };
  
  // Format shipping method to display name
  const getShippingMethodName = (method: string): string => {
    const methods: Record<string, string> = {
      'standard': 'Standard Shipping (5-7 days)',
      'express': 'Express Shipping (2-3 days)',
      'overnight': 'Overnight Shipping (1 day)',
    };
    return methods[method] || method;
  };
  
  // Format payment method to display name
  const getPaymentMethodName = (method: string): string => {
    const methods: Record<string, string> = {
      'credit': 'Credit Card',
      'paypal': 'PayPal',
      'invoice': 'Invoice',
    };
    return methods[method] || method;
  };

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-2" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderData.customer ? (
            <div className="space-y-1">
              <div className="font-medium">{orderData.customer.name}</div>
              <div className="text-sm text-muted-foreground">{orderData.customer.email}</div>
              {orderData.customer.phone && (
                <div className="text-sm text-muted-foreground">{orderData.customer.phone}</div>
              )}
              {orderData.customer.isNew && (
                <Badge className="mt-1" variant="outline">New Customer</Badge>
              )}
            </div>
          ) : (
            <div className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Customer information missing
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Products */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderData.products.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderData.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">{product.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.price * product.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(orderData.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{orderData.shipping ? formatCurrency(orderData.shipping.cost) : 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(orderData.tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(orderData.total)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-yellow-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              No products added to order
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipping Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Truck className="h-4 w-4 mr-2" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderData.shipping ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">SHIPPING METHOD</div>
                  <div className="font-medium">
                    {getShippingMethodName(orderData.shipping.method)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(orderData.shipping.cost)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    SHIPPING ADDRESS
                  </div>
                  <div className="text-sm">
                    {orderData.shipping.address.street}
                  </div>
                  <div className="text-sm">
                    {orderData.shipping.address.city}, {getStateName(orderData.shipping.address.state)} {orderData.shipping.address.postal_code}
                  </div>
                  <div className="text-sm">
                    {getCountryName(orderData.shipping.address.country)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-yellow-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Shipping information missing
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Payment Information */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orderData.payment ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">PAYMENT METHOD</div>
                  <div className="font-medium">
                    {getPaymentMethodName(orderData.payment.method)}
                  </div>
                </div>
                
                <div>
                  <Badge variant={orderData.payment.status === 'paid' ? 'success' : 'outline'}>
                    {orderData.payment.status === 'paid' ? 'Paid' : 'Payment Pending'}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="text-sm text-yellow-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                Payment information missing
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Order Notes */}
      {orderData.notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Order Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {orderData.notes}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validity Status */}
      <div className="mt-4">
        {isComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Order Ready for Submission</h3>
              <p className="text-sm text-green-700 mt-1">
                All order information is complete. You can now submit the order by clicking the "Create Order" button below.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Incomplete Order Information</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please go back and complete all required information in the previous steps.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 