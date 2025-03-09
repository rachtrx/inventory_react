import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { UserActionButton } from '../buttons/actions/UserActionButton';
import { ReturnButton } from '../buttons/actions/ReturnButton';

export default function UserActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
        {[
          FormType.LOAN, 
          FormType.ADD_USER, 
          FormType.DEL_USER,
          FormType.TAG_USER,
          FormType.UNTAG_USER,
        ].map((formType) => {
            return (
              <UserActionButton
                key={formType}
                formType={formType}
              />
            );
          })}
        </>
        <ReturnButton
          key={FormType.RETURN}
          formType={FormType.RETURN}
        />
      </Flex>
    )
  );
};

