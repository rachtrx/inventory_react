import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, FormType } from '../../context/ModalProvider';
import { AccTypeActionButton, CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';

export default function AccessoryActions() {

  return (
    <>
      <CircleReturnButton/>
      {[FormType.LOAN, FormType.UPDATE_ACC].map((formType) => {
        return (
          <CircleAccTypeActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
    </>
  );
};
