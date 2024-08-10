import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, formTypes } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';

export default function UserActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
        {[formTypes.LOAN, formTypes.RETURN, formTypes.ADD_USER, formTypes.DEL_USER].map((formType) => {
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

