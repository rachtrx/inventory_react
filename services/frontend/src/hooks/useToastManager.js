import { useCallback, useRef } from 'react';
import { useToast } from '@chakra-ui/react';

const useToastManager = () => {
  const toast = useToast();
  const shownToastsRef = useRef(new Set());

  const showToast = useCallback((message) => {
    if (!shownToastsRef.current.has(message)) {
      toast({
        title: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      shownToastsRef.current.add(message);
    }
  }, [toast]);

  const clearToasts = useCallback(() => {
    shownToastsRef.current.clear();
  }, []);

  return { showToast, clearToasts };
};

export default useToastManager;
