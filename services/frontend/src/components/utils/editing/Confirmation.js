import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Button,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ResponsiveText } from '../ResponsiveText';
import { CheckIcon } from '@chakra-ui/icons';

export const Confirmation = ({ email, setFieldValue, handleSubmit, isOpen, onClose }) => {

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
            <ModalHeader>Confirm Update</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <ResponsiveText mb={2}>Enter your email to confirm this action:</ResponsiveText>
            <Input
                value={email}
                onChange={(e) => setFieldValue('email', e.target.value)}
            />
            </ModalBody>
            <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
                colorScheme="green"
                ml={3}
                leftIcon={<CheckIcon />}
                isDisabled={!email || !email.includes('@')}
                onClick={() => handleSubmit(email)}
            >
                Confirm
            </Button>
            </ModalFooter>
        </ModalContent>
        </Modal>
    )
}