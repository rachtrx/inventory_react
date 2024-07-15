import React from 'react';
import { Spinner } from '@chakra-ui/react';
import { useUI } from '../context/UIProvider';

const LoadingSpinner = () => {
    
	const { loading } = useUI();

  if (!loading) return null;

    
    return(
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spinner
      thickness='4px'
      speed='0.65s'
      emptyColor='gray.200'
      color='blue.500'
      size='xl'
    />
  </div>
)};

export default LoadingSpinner;