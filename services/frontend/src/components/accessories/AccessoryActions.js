import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, FormType } from '../../context/ModalProvider';
import { AccTypeActionButton } from '../buttons/actions/AccTypeActionButton';

export default function AccessoryActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
          {[FormType.UPDATE_ACC].map((formType) => {
            return (
              <AccTypeActionButton
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
