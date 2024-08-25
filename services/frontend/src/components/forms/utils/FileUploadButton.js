import { Button, Icon } from "@chakra-ui/react";
import { useRef } from "react";
import { FaUpload } from "react-icons/fa";
import { ResponsiveText } from "../../utils/ResponsiveText";


export default function FileUploadButton({ fileInputRef, handleFileChange }) {

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
  <>
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
  </>
  );
};