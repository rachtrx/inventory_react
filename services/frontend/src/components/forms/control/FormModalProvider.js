import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    Divider,
    Text,
    useDisclosure
} from '@chakra-ui/react';
import { formMap, headerMap } from './helpers';
import { createContext, useContext, useEffect } from 'react';
import { useForm } from '../../../context/FormProvider';

const FormModalContext = createContext();

export const FormModalProvider = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { formType, setFormType } = useForm(); // e.g. "asset", "user", "loan"

  useEffect(() => {
    if (!isOpen) return;
    if (!formType) onClose();
  }, [isOpen, formType, onClose])

  return (
    <FormModalContext.Provider value={{ isOpen, onOpen, onClose }}>
        <Modal 
            isOpen={isOpen} 
            onClose={() => {
                setFormType(null);
            }} 
            scrollBehavior='outside' 
            size="xl" 
        >
            <ModalOverlay />
            {/* https://github.com/chakra-ui/chakra-ui/issues/7588 */}
            <ModalContent
                onWheel={(e) => {
                    e.stopPropagation();
                }}
                onTouchMove={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onScroll={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            >
                <ModalCloseButton/>
                <ModalHeader display="flex" alignItems="center" gap={1}>
                    <Text fontSize='lg'>{headerMap[formType]}</Text>
                    <Divider orientation="vertical" height='20px'/>
                </ModalHeader>
                {formMap[formType]}
            </ModalContent>
        </Modal>
        {children}
    </FormModalContext.Provider>
  );
};

export const useFormModal = () => {
  const context = useContext(FormModalContext);
  if (!context) {
    throw new Error('useForm must be used within a FormModalProvider');
  }
  return context;
};
