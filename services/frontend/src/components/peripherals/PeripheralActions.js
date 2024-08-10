import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, formTypes } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';

export default function PeripheralActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
          {[formTypes.ADD_PERIPHERAL].map((formType) => {
            return (
              <ActionButton
                key={formType}
                formType={formType}
              />
            );
          })}
        </>
      </Flex>
    )
  );
};
