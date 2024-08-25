import React from 'react';
import { Flex, useBreakpointValue } from '@chakra-ui/react';
import { useFormModal, actionTypes, formTypes } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import { buttonConfigs } from '../buttons/constants';

export default function AssetActions() {

  const isIpad = useBreakpointValue({ base: false, md: true, lg: true, xl: false });
  const isMobile = useBreakpointValue({ base: true, md: false, lg: false, xl: false });

  return (
    !isMobile && (
      <Flex justifyContent="space-around" alignItems="center" gap={4}>
        <>
          {[formTypes.LOAN, formTypes.RETURN, formTypes.ADD_ASSET, formTypes.DEL_ASSET].map((formType) => {
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

