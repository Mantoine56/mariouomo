'use client';

/**
 * OrderStatusTimeline Component
 * 
 * Displays a visual timeline of an order's status changes
 * Shows the order's journey from creation to delivery
 */

import { Order } from "@/lib/mock-api";
import { formatDate } from "@/lib/utils";
import { 
  Check, 
  Clock, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  X, 
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderStatusTimelineProps {
  status: Order['status'];
  createdAt: string;
  updatedAt: string;
  paymentStatus: Order['payment_status'];
}

/**
 * Maps order status to a number for timeline progression
 */
const getStatusStep = (status: Order['status']): number => {
  switch (status) {
    case 'pending': return 1;
    case 'confirmed': return 2;
    case 'processing': return 3;
    case 'shipped': return 4;
    case 'delivered': return 5;
    case 'cancelled': return -1;
    case 'refunded': return -2;
    default: return 0;
  }
};

/**
 * Get appropriate icon for a status step
 */
const getStepIcon = (step: number, currentStep: number) => {
  // For cancelled or refunded orders
  if (currentStep < 0) {
    if (step <= Math.abs(currentStep)) {
      return step === Math.abs(currentStep) ? 
        (currentStep === -1 ? <X className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />) : 
        <Check className="h-5 w-5" />;
    }
    return <Clock className="h-5 w-5 text-muted-foreground" />;
  }

  // For normal order flow
  if (step === 1) return <ShoppingCart className={cn("h-5 w-5", step <= currentStep ? "" : "text-muted-foreground")} />;
  if (step === 2) return <CreditCard className={cn("h-5 w-5", step <= currentStep ? "" : "text-muted-foreground")} />;
  if (step === 3) return <Package className={cn("h-5 w-5", step <= currentStep ? "" : "text-muted-foreground")} />;
  if (step === 4) return <Truck className={cn("h-5 w-5", step <= currentStep ? "" : "text-muted-foreground")} />;
  if (step === 5) return <Check className={cn("h-5 w-5", step <= currentStep ? "" : "text-muted-foreground")} />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
};

/**
 * Get label for a status step
 */
const getStepLabel = (step: number): string => {
  switch (step) {
    case 1: return "Order Placed";
    case 2: return "Confirmed";
    case 3: return "Processing";
    case 4: return "Shipped";
    case 5: return "Delivered";
    case -1: return "Cancelled";
    case -2: return "Refunded";
    default: return "";
  }
};

/**
 * OrderStatusTimeline Component
 */
export function OrderStatusTimeline({ 
  status, 
  createdAt, 
  updatedAt,
  paymentStatus
}: OrderStatusTimelineProps) {
  const currentStep = getStatusStep(status);
  
  // Define the steps to show in the timeline
  let steps = [1, 2, 3, 4, 5];
  
  // For cancelled or refunded orders, show a different timeline
  if (currentStep < 0) {
    steps = [1, 2, Math.abs(currentStep)];
  }

  return (
    <div className="space-y-8 py-4">
      <h3 className="text-lg font-medium">Order Timeline</h3>
      
      <div className="relative">
        {/* Connecting line */}
        <div className={cn(
          "absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200",
          currentStep < 0 && "bg-red-100"
        )} />
        
        {/* Timeline steps */}
        <div className="space-y-8">
          {steps.map((step) => {
            const isActive = currentStep === step || 
                            (currentStep < 0 && step === Math.abs(currentStep));
            const isCompleted = currentStep > step || 
                              (currentStep < 0 && step < Math.abs(currentStep));
            let stepStatus = isActive ? "active" : 
                            isCompleted ? "completed" : "pending";
                            
            // Special case for cancelled/refunded
            if (currentStep < 0 && step === Math.abs(currentStep)) {
              stepStatus = "cancelled";
            }
            
            return (
              <div key={step} className="relative flex items-center">
                {/* Step circle */}
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full z-10",
                  stepStatus === "completed" && "bg-green-100",
                  stepStatus === "active" && "bg-blue-100",
                  stepStatus === "cancelled" && "bg-red-100",
                  stepStatus === "pending" && "bg-gray-100"
                )}>
                  {getStepIcon(step, currentStep)}
                </div>
                
                {/* Step content */}
                <div className="ml-4">
                  <h4 className={cn(
                    "font-medium",
                    stepStatus === "completed" && "text-green-600",
                    stepStatus === "active" && "text-blue-600",
                    stepStatus === "cancelled" && "text-red-600"
                  )}>
                    {step === Math.abs(currentStep) && currentStep < 0 ? 
                      (currentStep === -1 ? "Cancelled" : "Refunded") : 
                      getStepLabel(step)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? formatDate(updatedAt) : 
                     isCompleted ? formatDate(createdAt) : "Pending"}
                  </p>
                  
                  {/* Payment status indicator for confirmed step */}
                  {step === 2 && (
                    <div className="mt-1">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        paymentStatus === "paid" && "bg-green-100 text-green-800",
                        paymentStatus === "pending" && "bg-yellow-100 text-yellow-800",
                        paymentStatus === "failed" && "bg-red-100 text-red-800"
                      )}>
                        Payment {paymentStatus}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 