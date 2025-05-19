import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { AssetActionButton, CircleAssetActionButton } from '../buttons/actions/AssetActionButton';
import { ActionButton } from '../buttons/actions/ActionButton';
import { CircleReturnButton, ReturnButton } from '../buttons/actions/ReturnButton';
import { AccTypeActionButton, CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { CircleUserActionButton, UserActionButton } from '../buttons/actions/UserActionButton';

export default function ReminderActions() {

  return (
    <>
      <CircleReturnButton />
      <CircleAssetActionButton formType={FormType.LOAN} />
    </>
  );
};
