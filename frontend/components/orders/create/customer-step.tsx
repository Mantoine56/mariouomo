'use client';

/**
 * Customer Selection Step
 * 
 * Allows selecting an existing customer or creating a new one
 * for the order creation process
 */

import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Customer type definition
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

// Props for the CustomerStep component
interface CustomerStepProps {
  initialData: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    isNew?: boolean;
  } | null;
  onComplete: (customerData: {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    isNew?: boolean;
  }) => void;
}

// Mock customer data (would be fetched from an API in a real app)
const mockCustomers: Customer[] = [
  { id: 'cust_1', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1 555-1234' },
  { id: 'cust_2', name: 'John Doe', email: 'john.doe@example.com', phone: '+1 555-5678' },
  { id: 'cust_3', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-9012' },
  { id: 'cust_4', name: 'Robert Brown', email: 'robert@example.com', phone: '+1 555-3456' },
  { id: 'cust_5', name: 'Emily Davis', email: 'emily@example.com', phone: '+1 555-7890' },
];

/**
 * CustomerStep Component
 * 
 * Provides UI for selecting an existing customer or creating a new one
 */
export function CustomerStep({ initialData, onComplete }: CustomerStepProps) {
  // Choice between existing or new customer
  const [customerType, setCustomerType] = useState<'existing' | 'new'>(
    initialData?.isNew ? 'new' : 'existing'
  );
  
  // State for selected customer when choosing existing
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialData && !initialData.isNew 
      ? mockCustomers.find(c => c.id === initialData.id) || null
      : null
  );
  
  // State for new customer form
  const [newCustomer, setNewCustomer] = useState({
    name: initialData?.isNew ? initialData.name : '',
    email: initialData?.isNew ? initialData.email : '',
    phone: initialData?.isNew ? initialData.phone || '' : '',
  });
  
  // Whether the customer combobox is open
  const [open, setOpen] = useState(false);
  
  // Track form validity
  const [isValid, setIsValid] = useState(false);
  
  // Validate form when inputs change
  useEffect(() => {
    if (customerType === 'existing') {
      setIsValid(!!selectedCustomer);
    } else {
      // Basic validation for new customer
      const isNameValid = newCustomer.name.trim().length > 0;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newCustomer.email);
      setIsValid(isNameValid && isEmailValid);
    }
  }, [customerType, selectedCustomer, newCustomer]);
  
  // Complete this step when valid
  useEffect(() => {
    if (!isValid) return;
    
    if (customerType === 'existing' && selectedCustomer) {
      onComplete({
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        isNew: false,
      });
    } else if (customerType === 'new' && isValid) {
      onComplete({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone || undefined,
        isNew: true,
      });
    }
  }, [isValid, customerType, selectedCustomer, newCustomer, onComplete]);
  
  /**
   * Handle input change for new customer form
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Customer Type Selection */}
      <RadioGroup
        value={customerType}
        onValueChange={(value) => setCustomerType(value as 'existing' | 'new')}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem
            value="existing"
            id="existing-customer"
            className="peer sr-only"
          />
          <Label
            htmlFor="existing-customer"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Search className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Existing Customer</span>
          </Label>
        </div>
        
        <div>
          <RadioGroupItem
            value="new"
            id="new-customer"
            className="peer sr-only"
          />
          <Label
            htmlFor="new-customer"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <UserPlus className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">New Customer</span>
          </Label>
        </div>
      </RadioGroup>
      
      {/* Customer Selection/Creation Form */}
      <Card>
        <CardContent className="pt-6">
          {customerType === 'existing' ? (
            <div className="space-y-4">
              <Label htmlFor="customer-select">Select Customer</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCustomer ? 
                      selectedCustomer.name : 
                      "Select customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search customers..." />
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {mockCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.name}
                          onSelect={() => {
                            setSelectedCustomer(customer);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCustomer?.id === customer.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {customer.email}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Selected Customer Details */}
              {selectedCustomer && (
                <div className="mt-4 rounded-md border p-4">
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-sm font-medium text-muted-foreground">Email:</span>
                      <span className="col-span-2 text-sm">{selectedCustomer.email}</span>
                    </div>
                    {selectedCustomer.phone && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                        <span className="col-span-2 text-sm">{selectedCustomer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter customer name"
                  value={newCustomer.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter customer email"
                  value={newCustomer.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={newCustomer.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Form Status */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {isValid ? (
            <span className="text-green-500 flex items-center">
              <Check className="mr-1 h-4 w-4" />
              Customer information is complete
            </span>
          ) : (
            <span>Please {customerType === 'existing' ? 'select a customer' : 'complete the customer information'}</span>
          )}
        </div>
      </div>
    </div>
  );
} 