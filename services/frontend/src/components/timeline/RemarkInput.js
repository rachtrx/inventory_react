import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon } from "@chakra-ui/icons";
import { useFormModal } from "../../context/ModalProvider";
import eventService from "../../services/EventService";
import { useUI } from "../../context/UIProvider";

export const RemarkInput = ({ eventId }) => {
  const [remark, setRemark] = useState("");
  const [isSubmitting, setSubmitting] = useState(false);
	const { triggerRefresh } = useFormModal();
	const { handleError } = useUI();

  const handleSubmit = async () => {
    if (!remark.trim()) return;

    setSubmitting(true);
    try {
      await eventService.addRemark(eventId, remark, Date.now());
      setRemark(""); // clear input
      triggerRefresh(); // if passed
    } catch (err) {
      handleError("Failed to add remark.");
    }
    setSubmitting(false);
  };

  return (
    <Flex gap={1}>
      <Input
        size="sm"
        placeholder="Add remark"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        py={1}
      />
      <IconButton
        icon={<AddIcon />}
        colorScheme="blue"
        size="sm"
        aria-label="Add Remark"
        isLoading={isSubmitting}
        onClick={handleSubmit}
        h="auto"
        alignSelf="stretch"
        aspectRatio={1} // ✅ makes width = height
      />
    </Flex>
  );
};
