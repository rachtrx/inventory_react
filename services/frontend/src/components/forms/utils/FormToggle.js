import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import Toggle from './Toggle';
import { useCallback } from 'react';

export default function FormToggle({label, name}) {

    const { setFieldValue } = useFormikContext();
  
      // Pass the toggle state and handleChange as props to the wrapped component
      return (
        <Toggle 
          label={label}
          check_fn={useCallback(() => {
            setFieldValue(name, true)
          }, [setFieldValue, name])}
          uncheck_fn={useCallback(() => {
            setFieldValue(name, false)
          }, [setFieldValue, name])}
        />
    );    
};