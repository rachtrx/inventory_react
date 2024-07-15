import React, { useEffect, useState } from 'react';
import { FormLabel, HStack, Switch } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import Toggle from './Toggle';
import { useForm } from '../../../../context/FormProvider';
import { useCallback } from 'react';

export default function ExcelToggle({fieldsToReset}) {

    const { setIsExcel } = useForm()
    const { setFieldValue } = useFormikContext();
  
      // Pass the toggle state and handleChange as props to the wrapped component
      return (
        <Toggle 
          label="Use Excel"
          check_fn={useCallback(() => {
            setIsExcel(true);
            fieldsToReset.forEach((field) => setFieldValue(field, ''))
          }, [fieldsToReset, setFieldValue, setIsExcel])}
          uncheck_fn={useCallback(() => {
            setIsExcel(false);
          }, [setIsExcel])}
        />
    );
};
