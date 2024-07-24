import React, { useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import SignatureCanvas from 'react-signature-canvas';
import { FormControl, FormLabel, Button, Box, Flex } from '@chakra-ui/react';
import { ResponsiveText } from '../../utils/ResponsiveText';

export const FormikSignatureField = ({ name, label, ...props }) => {
  const [, , helpers] = useField(name);
  const containerRef = useRef(null);
  const sigPadRef = useRef(null);
	const [dimensions, setDimensions] = useState({ width: 500, height: 200 });

  const updateDimensions = () => {
    if (containerRef.current) {
			const width = containerRef.current.offsetWidth - 20
      setDimensions({
        width: width,
        height: width * 0.3
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
    // Save the signature as a data URL
    const signatureImage = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    helpers.setValue(signatureImage);
  };

  return (
    <FormControl>
      <FormLabel htmlFor={name}>{label}</FormLabel>
      <Flex direction="column" align="stretch">
        <Box ref={containerRef} border="2px" borderColor="gray.200" width="100%" p={2}>
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
      </Flex>
    </FormControl>
  );
};
