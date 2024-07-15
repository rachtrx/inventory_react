import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useForm } from '../../context/FormProvider';
import ActionButton from '../buttons/ActionButton';

export default function AssetActions() {

  const { setFormType } = useForm()
  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
          <ActionButton bg="blue.100" onClick={() => setFormType('loanAsset')}>
            Loan
          </ActionButton>
          <ActionButton bg="orange.100" onClick={() => setFormType('returnAsset')}>
            Return
          </ActionButton>
            <ActionButton bg="green.100" onClick={() => setFormType('addAsset')}>
              Add
            </ActionButton>
            <ActionButton bg="red.100" onClick={() => setFormType('condemnAsset')}>
              Condemn
            </ActionButton>
          </>
      </Flex>
    )
  );
};

