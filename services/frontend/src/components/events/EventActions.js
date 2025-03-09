import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import { ActionButton } from '../buttons/actions/ActionButton';

export default function EventActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
          {[
            FormType.LOAN, 
            FormType.RETURN, 
            FormType.ADD_ASSET, 
            FormType.DEL_ASSET, 
            FormType.ADD_USER,
            FormType.DEL_USER,
            FormType.UPDATE_ACC,
            FormType.TAG_ASSET,
            FormType.UNTAG_ASSET,
            FormType.TAG_USER,
            FormType.UNTAG_USER,
          ].map((formType) => {
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
