import { motion } from "framer-motion";
import { Box, Stack, VStack } from "@chakra-ui/react";

export default function ActionSidebar({ isOpen, setIsOpen, children }) {
  return isOpen ? (
    <Box
      position="absolute"
      top="120%" // Position above the button
      left="0"
      mb={2} // Small margin between button and sidebar
      zIndex={4} // Ensure it appears above other content
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 5 }}  // Start slightly smaller
        animate={isOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 5 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }} // Reduce stiffness for smoother animation
      >
        {/* Ensure buttons stack vertically */}
        <VStack spacing={2}>
          {children}
        </VStack>
      </motion.div>
    </Box>
  ) : null
}
