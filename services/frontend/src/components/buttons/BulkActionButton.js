import { Button } from "@chakra-ui/react"
import React from "react";

export const BulkActionButton = React.forwardRef(({ children, ...props }, ref) => (
  <Button 
    ref={ref} 
    size="sm"
    variant="outline"
    {...props}
>
    {children}
  </Button>
));