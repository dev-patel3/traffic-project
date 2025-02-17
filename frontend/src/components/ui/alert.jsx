import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

// The Alert component can be used to show different types of messages to users.
// It supports different variants (default, destructive, success) and can contain
// a title and description.
const Alert = React.forwardRef(({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}, ref) => {
  // Define the base styles that will be applied to all alerts
  const baseStyles = "relative w-full rounded-lg border p-4";
  
  // Define variant-specific styles and icons
  const variants = {
    default: {
      styles: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info
    },
    destructive: {
      styles: "bg-red-50 border-red-200 text-red-800",
      icon: AlertTriangle
    },
    success: {
      styles: "bg-green-50 border-green-200 text-green-800",
      icon: CheckCircle
    }
  };

  // Get the appropriate styles and icon for the current variant
  const variantConfig = variants[variant] || variants.default;
  const Icon = variantConfig.icon;

  return (
    <div
      ref={ref}
      role="alert"
      className={`${baseStyles} ${variantConfig.styles} ${className}`}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="ml-3">
          {children}
        </div>
      </div>
    </div>
  );
});

Alert.displayName = "Alert";

// AlertTitle provides a consistent way to add a title to the alert
const AlertTitle = React.forwardRef(({ 
  children, 
  className = "", 
  ...props 
}, ref) => (
  <h5
    ref={ref}
    className={`font-medium mb-1 ${className}`}
    {...props}
  >
    {children}
  </h5>
));

AlertTitle.displayName = "AlertTitle";

// AlertDescription provides a consistent way to add a description to the alert
const AlertDescription = React.forwardRef(({ 
  children, 
  className = "", 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={`text-sm ${className}`}
    {...props}
  >
    {children}
  </div>
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };