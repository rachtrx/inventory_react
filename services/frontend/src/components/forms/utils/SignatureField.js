import React, { useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import SignatureCanvas from 'react-signature-canvas';
import { FormControl, FormLabel, Button, Box, Flex, IconButton, Collapse } from '@chakra-ui/react';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

export const FormikSignatureField = ({ name, label, ...props }) => {
  const [, , helpers] = useField(name);
  const containerRef = useRef(null);
  const sigPadRef = useRef(null);
	const [dimensions, setDimensions] = useState({ width: 500, height: 200 });
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateDimensions = () => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth - 20;
      setDimensions({
        width: width,
        height: width * 0.3,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions(); // Initial size update

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const handleEnd = () => {
    const signatureImage = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    helpers.setValue(signatureImage);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <FormControl>
      <Flex alignItems="center" ref={containerRef}>
        {label && (
          <FormLabel htmlFor={name} mb={0}>
            <ResponsiveText>{label}</ResponsiveText>
          </FormLabel>
        )}
        <IconButton
          aria-label={isCollapsed ? 'Expand signature pad' : 'Collapse signature pad'}
          icon={isCollapsed ? <ChevronDownIcon /> : <ChevronUpIcon />}
          size="sm"
          variant="ghost"
          onClick={toggleCollapse}
        />
      </Flex>
      <Collapse in={!isCollapsed} width={'100%'}>
        <Box border="2px" borderColor="gray.200" p={2}>
          <SignatureCanvas
					  width={"100%"}
            penColor="black"
            canvasProps={{
              width: dimensions.width,
          		height: dimensions.height,
              className: 'sigCanvas'
            }}
            ref={sigPadRef}
            onEnd={handleEnd}
            {...props}
          />
        </Box>
        <Flex justify="flex-end" mt={2}>
          <Button
            onClick={() => {
              sigPadRef.current.clear();
              helpers.setValue('');
            }}
          >
            <ResponsiveText>Clear Signature</ResponsiveText>
          </Button>
        </Flex>
      </Collapse>
    </FormControl>
  );
};
