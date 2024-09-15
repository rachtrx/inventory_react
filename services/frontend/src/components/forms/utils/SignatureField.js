import React, { useEffect, useRef, useState } from 'react';
import { useField } from 'formik';
import SignatureCanvas from 'react-signature-canvas';
import { FormControl, FormLabel, Button, Box, Flex, IconButton, Collapse } from '@chakra-ui/react';
import { ResponsiveText } from '../../utils/ResponsiveText';
import { RepeatIcon } from '@chakra-ui/icons';

export const FormikSignatureField = ({ name, label, signatureFieldWidth, ...props }) => {
  const [, , helpers] = useField(name);
  const sigPadRef = useRef(null);
	const [dimensions, setDimensions] = useState({ width: 500, height: 200 });

  useEffect(() => {
    const width = signatureFieldWidth;
    setDimensions({
      width: `${width}px`,
      height: `${width * 0.2}px`,
    });
  }, [signatureFieldWidth]);

  const handleEnd = () => {
    const signatureImage = sigPadRef.current.getTrimmedCanvas().toDataURL('image/png');
    helpers.setValue(signatureImage);
  };

  return (
    <FormControl>
      <Flex direction='column' alignItems="flex-start">
        {label && (
          <FormLabel htmlFor={name} display="flex" alignItems="center" justifyContent="space-between" mb={0}>
            <ResponsiveText>{label}</ResponsiveText>
            
            <IconButton
              aria-label="Clear Signature"
              icon={<RepeatIcon />} 
              size="sm"
              variant="ghost"
              onClick={() => {
                sigPadRef.current.clear();
                helpers.setValue('');
            }}
          />
        </FormLabel>
        )}
        <Box border="2px" borderColor="gray.200" p={1}>
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
      </Flex>
    </FormControl>
  );
};
