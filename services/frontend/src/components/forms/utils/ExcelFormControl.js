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
import { ResponsiveText } from '../../utils/ResponsiveText';
import { useFormModal } from '../../../context/ModalProvider';
import { useUI } from '../../../context/UIProvider';
import { FaUpload } from "react-icons/fa";

import * as XLSX from 'xlsx';

const ExcelFormControl = ({ templateCols, loadValues }) => {

  const { formType, setInitialValues } = useFormModal();
  const fileInputRef = useRef(null);
  const { showToast, handleError } = useUI();
  const { setFieldValue } = useFormikContext()

  const handleDownloadTemplate = () => {


    const wb = XLSX.utils.book_new();

    const ws_name = `${formType}`;
    const ws_data = [templateCols, Array(templateCols.length).fill(null)];
  
    // Create a worksheet with headers and some sample data
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
  
    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
  
    // Write the workbook and trigger download
    XLSX.writeFile(wb, `${formType}.xlsx`);
    
    // For demonstration, showing a toast message
    showToast("Your template will start downloading shortly.", 'info');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = await parseExcelFile(file);
    console.log(data);

    const keysFromExcel = data.length > 0 ? Object.keys(data[0]) : [];

    try {
      if (new Set([...keysFromExcel, ...templateCols]).size !== templateCols.length) {
        throw new Error("Column names were changed unexpectedly.");
      }
      loadValues(data);
    } catch (err) {
      handleError(err);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log(keysFromExcel);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <Grid mt={4} templateColumns="repeat(2, 1fr)" gap={4} w={"100%"}>
      <Button size="md" bg="white" h="32px" onClick={handleDownloadTemplate} justifyContent={'space-around'}>
        <Icon as={FaDownload} />
          <ResponsiveText>Get Template</ResponsiveText>
      </Button>
      <Button onClick={handleButtonClick} bg="white" height="32px" justifyContent={'space-around'}>
        <Icon as={FaUpload} />
          <ResponsiveText>Fill with Template</ResponsiveText>
      </Button>
      <input
        type="file"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </Grid>
  );
};

async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Assuming the first sheet of the workbook; you can modify this as needed
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const json = XLSX.utils.sheet_to_json(worksheet);
      resolve(json);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

export default ExcelFormControl;