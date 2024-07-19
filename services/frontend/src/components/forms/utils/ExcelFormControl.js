import React, { useRef, useState } from 'react';
import {
  Button,
  useToast,
  Icon,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa';
import FileUploadButton from './FileUploadButton';
import FileNameDisplay from './FileNameDisplay';
import { useFormikContext } from 'formik';

const ExcelFormControl = ({ expectedKeys }) => {

  const { values, setFieldValue } = useFormikContext();
  const fileInputRef = useRef(null);
  const toast = useToast();
  const [fileName, setFileName] = useState('');

  const handleDownloadTemplate = () => {
    // Implement your download logic here
    // For example, setting window.location.href to the template URL
    // window.location.href = 'URL_TO_YOUR_TEMPLATE.xlsx';
    
    // For demonstration, showing a toast message
    toast({
        title: 'Template downloading...',
        description: "Your template will start downloading shortly.",
        status: 'info',
        duration: 5000,
        isClosable: true,
    });
  };

  const validateExcelData = (data) => {
    // Extract keys from the first row (assuming it contains column names)
    const keysFromExcel = data.length > 0 ? Object.keys(data[0]) : [];
  
    // Check if all expected keys are present
    return expectedKeys.every(key => keysFromExcel.includes(key));
  };

  const resetFileInput = () => {
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Grid mt={4} templateColumns="repeat(2, 1fr)" gap={4} w={"100%"}>
      <FileUploadButton
        fileInputRef={fileInputRef}
        setFileName={setFileName}
        onFileProcessed={(data) => {
          // Update the form state based on the Excel file's data
          // Assuming `data` is an object where keys match your form field names
          for (const key in data) {
            setFieldValue(key, data[key]);
          }
        }}
      />
      <Button size="md" bg="white" h="32px" onClick={handleDownloadTemplate}>
        <Icon as={FaDownload} />
          &nbsp;Template
      </Button>
      <GridItem colSpan={2}>
        <FileNameDisplay fileName={fileName} resetFileInput={resetFileInput}/>
      </GridItem>
    </Grid>
  );
};

export default ExcelFormControl;