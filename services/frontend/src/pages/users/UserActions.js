import React from 'react';
import { Button } from '@chakra-ui/react';
import { openDrawer } from '../../redux/actions/ui';
import { useDispatch } from 'react-redux';

export default function UserActions() {

    const dispatch = useDispatch()

    const handleButtonClick = (drawerContent) => () => {
      console.log('Button clicked');
      dispatch(openDrawer(drawerContent));
    };

  return (
    <>
      <Button colorScheme="blue" onClick={handleButtonClick('createUser')}>Create User</Button>
      <Button colorScheme="red" onClick={handleButtonClick('removeUser')}>Remove User</Button>
    </>
  );
};
