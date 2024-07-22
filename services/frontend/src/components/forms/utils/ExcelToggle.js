import React, { useEffect, useState } from 'react';
import { FormLabel, HStack, Switch } from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { useCallback } from 'react';
import Toggle from './Toggle';
import { useFormModal, actionTypes } from '../../../context/ModalProvider';

export default function ExcelToggle({ fieldsToReset }) {
  const { dispatch } = useFormModal();
  const { setFieldValue } = useFormikContext();

  const check_fn = useCallback(() => {
    dispatch({ type: actionTypes.SET_IS_EXCEL, payload: true });
    fieldsToReset.forEach(field => setFieldValue(field, ''));
  }, [fieldsToReset, setFieldValue, dispatch]);

  const uncheck_fn = useCallback(() => {
    dispatch({ type: actionTypes.SET_IS_EXCEL, payload: false });
  }, [dispatch]);

  return (
    <Toggle 
      label="Use Excel"
      check_fn={check_fn}
      uncheck_fn={uncheck_fn}
    />
  );
}