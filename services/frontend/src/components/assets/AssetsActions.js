import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, FormType } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';

export default function AssetsActions() {

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
            FormType.TAG_ASSET,
            FormType.UNTAG_ASSET
          ].map((formType) => {
            return (
              <AssetActionButton
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

