import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useModal, actionTypes } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';

export default function AssetActions() {

  const { dispatch } = useModal()
  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
        <ActionButton bg="blue.100" onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: 'loanAsset' })}>
            Loan
          </ActionButton>
          <ActionButton bg="orange.100" onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: 'returnAsset' })}>
            Return
          </ActionButton>
          <ActionButton bg="green.100" onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: 'addAsset' })}>
            Add
          </ActionButton>
          <ActionButton bg="red.100" onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: 'condemnAsset' })}>
            Condemn
          </ActionButton>
          </>
      </Flex>
    )
  );
};

