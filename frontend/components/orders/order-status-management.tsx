'use client';

/**
 * OrderStatusManagement Component
 * 
 * Provides an interface for managing the status of an order
 * with options to change status, add notes, and handle special cases
 */

import { useState } from "react";
import { Order } from "@/lib/mock-api";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Ban, Check, Clock, Package, RotateCcw, ShoppingCart, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

/**
 * Format a status string to title case
 */
const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

interface OrderStatusManagementProps {
  order: Order;
  onStatusUpdate: (status: Order['status'], note?: string) => void;
}

/**
 * Available order statuses with labels and icons
 */
const ORDER_STATUSES = [
  { value: "pending", label: "Pending", icon: <Clock className="h-4 w-4 mr-2" /> },
  { value: "confirmed", label: "Confirmed", icon: <ShoppingCart className="h-4 w-4 mr-2" /> },
  { value: "processing", label: "Processing", icon: <Package className="h-4 w-4 mr-2" /> },
  { value: "shipped", label: "Shipped", icon: <Truck className="h-4 w-4 mr-2" /> },
  { value: "delivered", label: "Delivered", icon: <Check className="h-4 w-4 mr-2" /> },
  { value: "cancelled", label: "Cancelled", icon: <Ban className="h-4 w-4 mr-2" /> },
  { value: "refunded", label: "Refunded", icon: <RotateCcw className="h-4 w-4 mr-2" /> },
];

/**
 * Get status badge variant based on status
 */
const getStatusVariant = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'processing':
    case 'confirmed':
      return 'default';
    case 'shipped':
      return 'secondary';
    case 'pending':
      return 'warning';
    case 'cancelled':
    case 'refunded':
      return 'destructive';
    default:
      return 'default';
  }
};

/**
 * OrderStatusManagement Component
 */
export function OrderStatusManagement({
  order,
  onStatusUpdate,
}: OrderStatusManagementProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handle status selection change
   */
  const handleStatusChange = (value: string) => {
    setStatus(value as Order['status']);
    
    // If changing to cancelled or refunded, request confirmation and note
    if (value === 'cancelled' || value === 'refunded') {
      setShowConfirmation(true);
    } else {
      setShowConfirmation(false);
    }
  };

  /**
   * Handle status update submission
   */
  const handleSubmit = () => {
    // For cancelled/refunded statuses, require a note
    if ((status === 'cancelled' || status === 'refunded') && !note.trim()) {
      toast({
        title: "Note required",
        description: `Please add a note explaining why the order was ${status}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      onStatusUpdate(status, note.trim() || undefined);
      
      toast({
        title: "Status updated",
        description: `Order status has been updated to ${formatStatus(status)}.`,
      });
      
      setIsSubmitting(false);
      setShowConfirmation(false);
      setNote("");
    }, 500);
  };

  /**
   * Determine if status update should show a warning
   */
  const showWarning = () => {
    // Show warning when moving to a cancelled/refunded state
    if (status === 'cancelled' || status === 'refunded') {
      return true;
    }
    
    // Show warning when moving backwards in the order lifecycle
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);
    
    if (currentIndex > -1 && newIndex > -1 && newIndex < currentIndex) {
      return true;
    }
    
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Order Status Management</h3>
        
        <div className="flex items-center mb-4">
          <span className="mr-2 text-sm text-muted-foreground">Current status:</span>
          <Badge variant={getStatusVariant(order.status)}>
            {formatStatus(order.status)}
          </Badge>
        </div>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Update Status
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    <div className="flex items-center">
                      {statusOption.icon}
                      {statusOption.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(showConfirmation || showWarning()) && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm text-amber-800 font-medium">
                    {status === 'cancelled' ? 'Cancelling this order' : 
                     status === 'refunded' ? 'Refunding this order' : 
                     'Changing order status'}
                  </p>
                  <p className="text-xs text-amber-700">
                    {status === 'cancelled' ? 
                      'Cancelling this order will stop all further processing. Please add a note explaining why this order is being cancelled.' : 
                     status === 'refunded' ? 
                      'Refunding this order will initiate a refund process. Please add a note with refund details.' : 
                      'You are changing the order status to a previous stage in the workflow. This may have implications for fulfillment and customer communications.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              Add Note {(status === 'cancelled' || status === 'refunded') && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              id="note"
              placeholder="Enter a note about this status change"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This note will be recorded in the order history and visible to other administrators.
            </p>
          </div>
          
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || status === order.status}
            >
              Update Status
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 