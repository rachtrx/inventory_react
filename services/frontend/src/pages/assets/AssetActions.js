import React from 'react';
import { Flex, Button } from '@chakra-ui/react';
import { useDispatch } from 'react-redux';
import { openDrawer } from '../../redux/actions/ui';

export default function AssetActions() {

  const dispatch = useDispatch()

  const handleButtonClick = (drawerContent) => () => {
    console.log('Button clicked');
    dispatch(openDrawer(drawerContent)); // Updates store to open the drawer and passes in the right type of form to display
  };

  return (
    <Flex justifyContent="space-around" alignItems="center" mt={4}>
      <Button colorScheme="blue" onClick={handleButtonClick('addAsset')}>Add Asset</Button>
      <Button colorScheme="green" onClick={handleButtonClick('loanAsset')}>Loan Asset</Button>
      <Button colorScheme="orange" onClick={handleButtonClick('returnAsset')}>Return Asset</Button>
      <Button colorScheme="red" onClick={handleButtonClick('condemnAsset')}>Condemn Asset</Button>
    </Flex>
  );
};

