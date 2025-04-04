import { Button, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Spinner, useDisclosure } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react";
import eventService from "../../../services/EventService";

const SignatureViewer = ({ filepath }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [imageSrc, setImageSrc] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const fetchSignature = useCallback(async () => {
        setLoading(true);
        try {
          const res = await eventService.getSignature(filepath); 
          const url = URL.createObjectURL(res.data);
          setImageSrc(url);
        } catch (err) {
          console.error('Error loading signature:', err);
        }
        setLoading(false);
    }, [filepath]);
  
    useEffect(() => {
      if (isOpen) fetchSignature();
    }, [isOpen, fetchSignature]);
  
    return (
      <>
        <Button onClick={onOpen} width="auto" alignSelf="start">
            View Signature
        </Button>
  
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Signature</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {loading ? (
                <Spinner />
              ) : (
                <Image src={imageSrc} alt="Signature" maxW="100%" />
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </>
    );
  };
  
  export default SignatureViewer;