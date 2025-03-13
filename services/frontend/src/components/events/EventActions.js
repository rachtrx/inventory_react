import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { AssetActionButton, CircleAssetActionButton } from '../buttons/actions/AssetActionButton';
import { ActionButton } from '../buttons/actions/ActionButton';
import { CircleReturnButton, ReturnButton } from '../buttons/actions/ReturnButton';
import { AccTypeActionButton, CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { CircleUserActionButton, UserActionButton } from '../buttons/actions/UserActionButton';

export default function EventActions() {

  return (
    <>
      <CircleReturnButton />
      {[
        FormType.LOAN,
        FormType.ADD_ASSET, 
        FormType.DEL_ASSET,
      ].map((formType) => {
        return (
          <CircleAssetActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
      {[
        FormType.ADD_USER,
        FormType.DEL_USER,
      ].map((formType) => {
        return (
          <CircleUserActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
      <CircleAccTypeActionButton
        key={FormType.UPDATE_ACC}
        formType={FormType.UPDATE_ACC}
      />
    </>
  );
};
