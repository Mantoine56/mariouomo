'use client';

/**
 * OrderFulfillment Component
 * 
 * Allows admins to manage the fulfillment process for an order
 * including shipping details, tracking information, and status updates
 */

import { useState } from "react";
import { Order } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Check, Clipboard, ExternalLink, Package, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface OrderFulfillmentProps {
  order: Order;
  onTrackingUpdate: (trackingNumber: string, carrier: string) => void;
  onStatusUpdate: (status: Order['status']) => void;
}

/**
 * Shipping carriers options
 */
const CARRIERS = [
  { label: "FedEx", value: "fedex" },
  { label: "UPS", value: "ups" },
  { label: "USPS", value: "usps" },
  { label: "DHL", value: "dhl" },
];

/**
 * OrderFulfillment Component
 */
export function OrderFulfillment({
  order,
  onTrackingUpdate,
  onStatusUpdate,
}: OrderFulfillmentProps) {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [carrier, setCarrier] = useState("fedex");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  /**
   * Handle copying tracking number to clipboard
   */
  const handleCopyTracking = () => {
    if (trackingNumber) {
      navigator.clipboard.writeText(trackingNumber);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: "Tracking number copied to clipboard",
      });
    }
  };

  /**
   * Handle tracking information update
   */
  const handleUpdateTracking = () => {
    if (!trackingNumber) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      onTrackingUpdate(trackingNumber, carrier);
      
      toast({
        title: "Tracking updated",
        description: "Tracking information has been updated",
      });
      
      setIsUpdating(false);
    }, 500);
  };

  /**
   * Handle shipping the order
   */
  const handleShipOrder = () => {
    if (!trackingNumber) {
      toast({
        title: "Warning",
        description: "Please enter a tracking number before shipping",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate('shipped');
      
      toast({
        title: "Order shipped",
        description: "Order has been marked as shipped",
      });
      
      setIsUpdating(false);
    }, 500);
  };

  /**
   * Handle marking order as delivered
   */
  const handleMarkDelivered = () => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate('delivered');
      
      toast({
        title: "Order delivered",
        description: "Order has been marked as delivered",
      });
      
      setIsUpdating(false);
    }, 500);
  };

  /**
   * Helper to get tracking URL
   */
  const getTrackingUrl = () => {
    if (!trackingNumber) return '';
    
    switch (carrier) {
      case 'fedex':
        return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}`;
      case 'ups':
        return `https://www.ups.com/track?tracknum=${trackingNumber}`;
      case 'usps':
        return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
      case 'dhl':
        return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
      default:
        return '';
    }
  };

  /**
   * Render fulfillment status based on order status
   */
  const renderFulfillmentStatus = () => {
    if (order.status === 'delivered') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="font-medium text-green-800">Order Delivered</h4>
          </div>
          <p className="text-sm text-green-600 mt-1">
            This order was delivered on {formatDate(order.updated_at)}.
          </p>
        </div>
      );
    }
    
    if (order.status === 'shipped') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <Truck className="h-5 w-5 text-blue-500 mr-2" />
            <h4 className="font-medium text-blue-800">Order Shipped</h4>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            This order was shipped on {formatDate(order.updated_at)}.
          </p>
          {order.tracking_number && (
            <div className="mt-2 flex items-center">
              <span className="text-sm text-gray-500 mr-2">Tracking:</span>
              <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded">
                {order.tracking_number}
              </code>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 ml-1" 
                onClick={handleCopyTracking}
              >
                {showCopied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Clipboard className="h-4 w-4" />
                )}
              </Button>
              <a 
                href={getTrackingUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 ml-2 text-sm flex items-center"
              >
                Track <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Order Fulfillment</h3>
      
      {renderFulfillmentStatus()}
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="col-span-2">
          <Label htmlFor="tracking-number">Tracking Number</Label>
          <div className="flex mt-1">
            <Input
              id="tracking-number"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              className="ml-1"
              onClick={handleCopyTracking}
              disabled={!trackingNumber}
            >
              {showCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor="carrier">Shipping Carrier</Label>
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger id="carrier" className="mt-1 w-full">
              <SelectValue placeholder="Select carrier" />
            </SelectTrigger>
            <SelectContent>
              {CARRIERS.map((carrier) => (
                <SelectItem key={carrier.value} value={carrier.value}>
                  {carrier.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          onClick={handleUpdateTracking}
          disabled={isUpdating || !trackingNumber}
        >
          Update Tracking
        </Button>
        
        {order.status === 'processing' && (
          <Button
            onClick={handleShipOrder}
            disabled={isUpdating || !trackingNumber}
            className="flex items-center"
          >
            <Truck className="mr-2 h-4 w-4" />
            Mark as Shipped
          </Button>
        )}
        
        {order.status === 'shipped' && (
          <Button
            onClick={handleMarkDelivered}
            disabled={isUpdating}
            className="flex items-center"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        )}
      </div>
      
      {order.status !== 'delivered' && order.status !== 'shipped' && order.status !== 'processing' && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
          <p className="text-sm text-amber-600">
            This order must be in Processing status before it can be shipped.
          </p>
        </div>
      )}
    </div>
  );
} 