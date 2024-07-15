import React, { useEffect, useState } from 'react';
import { useFormikContext } from 'formik';
import Toggle from './Toggle';
import { useForm } from '../../../../context/FormProvider';
import { useCallback } from 'react';

export default function FormToggle({label, name, value}) {

    const { setFieldValue } = useFormikContext();
  
      // Pass the toggle state and handleChange as props to the wrapped component
      return (
        <Toggle 
          label={label}
          check_fn={useCallback(() => {
            setFieldValue(name, value)
          }, [setFieldValue, name, value])}
          uncheck_fn={useCallback(() => {
            setFieldValue(name, value)
          }, [setFieldValue, name, value])}
        />
    );    
};