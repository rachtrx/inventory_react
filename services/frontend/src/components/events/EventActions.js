import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import { ActionButton } from '../buttons/actions/ActionButton';
import { ReturnButton } from '../buttons/actions/ReturnButton';
import { AccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { UserActionButton } from '../buttons/actions/UserActionButton';

export default function EventActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
          {[
            FormType.LOAN, 
            FormType.ADD_ASSET, 
            FormType.DEL_ASSET, 
            FormType.TAG_ASSET,
            FormType.UNTAG_ASSET,
          ].map((formType) => {
            return (
              <AssetActionButton
                key={formType}
                formType={formType}
              />
            );
          })}
          <ReturnButton />
          <AccTypeActionButton
            key={FormType.UPDATE_ACC}
            formType={FormType.UPDATE_ACC}
          />
          {[
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
      </Flex>
    )
  );
};
