import { Button, Icon } from "@chakra-ui/react";
import { useRef } from "react";
import { FaUpload } from "react-icons/fa";


export default function FileUploadButton({ fileInputRef, setFileName, onFileProcessed }) {

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Update the state with the file name
    } else return;

    // Placeholder for processing the Excel file
    // For example, using a library to parse the Excel file and extract data
    const data = await parseExcelFile(file);

    // Call the callback function with the processed data
    onFileProcessed(data);
  };

  return (
  <>
    <Button onClick={handleButtonClick} colorScheme="blue" height="32px">
      <Icon as={FaUpload} />
        &nbsp;Upload
    </Button>
    <input
      type="file"
      accept=".xlsx, .xls"
      style={{ display: 'none' }}
      ref={fileInputRef}
      onChange={handleFileChange}
    />
  </>
  );
};

async function parseExcelFile(file) {
  // Use a library like xlsx to read the file and return the data
  return {}; // Return the parsed data
}