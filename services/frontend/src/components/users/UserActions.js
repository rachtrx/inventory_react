import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { CircleUserActionButton, UserActionButton } from '../buttons/actions/UserActionButton';
import { CircleReturnButton, ReturnButton } from '../buttons/actions/ReturnButton';

export default function UserActions() {

  return (
        <>
        <CircleReturnButton/>
        {[
          FormType.LOAN, 
          FormType.ADD_USER, 
          FormType.DEL_USER,
          FormType.TAG_USER,
          FormType.UNTAG_USER,
        ].map((formType) => {
            return (
              <CircleUserActionButton
                key={formType}
                formType={formType}
              />
            );
          })}
        </>
    )
};

