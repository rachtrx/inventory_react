import React, { useEffect, useState } from 'react';
import { FormLabel, HStack, Switch } from '@chakra-ui/react';

export default function Toggle({label, check_fn, uncheck_fn}) {
    const [isChecked, setIsChecked] = useState(false);

    // useEffect(() => {
    //     console.log("check_fn redefined");
    //   }, [check_fn]);
      
    //   useEffect(() => {
    //     console.log("uncheck_fn redefined");
    //   }, [uncheck_fn]);

    const handleChange = () => {
        // Log current state
        console.log(`Resetting values in Toggle Function. isChecked before: ${isChecked}`);
        
        // Update the state using the functional update form
        setIsChecked(prevChecked => !prevChecked);
    };

    useEffect(() => {
        console.log(`Resetting values in Toggle Function. isChecked after: ${isChecked}`);
    
        if (isChecked) {
            // Switched on, reset initial
            check_fn();
        } else {
            // Not switched on, reset alternates
            uncheck_fn();
        }
    }, [isChecked, check_fn, uncheck_fn]);
  
      // Pass the toggle state and handleChange as props to the wrapped component
      return (
        <HStack justify="space-between">
            <FormLabel mb="0">{label}</FormLabel>
            <Switch isChecked={isChecked} onChange={handleChange} />
        </HStack>
    );    
};
