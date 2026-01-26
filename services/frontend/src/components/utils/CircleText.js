import { Box, Circle, Text, Tooltip } from "@chakra-ui/react";
import React, { useState } from "react";
import { motion } from "framer-motion";

// Function to extract initials from a given string
function getInitials(string) {
  const words = string.split(" ");
  const initials = words.map((word) => word[0]).join("");
  return initials.slice(0, Math.min(2, initials.length)).toUpperCase();
}

// Function to check if a value is a number
const isNumber = (text) => {
  return !isNaN(text) && !isNaN(parseFloat(text));
};

// CircleText component that displays text inside a circular button
export const CircleText = React.forwardRef(
  ({ text, textSize = "sm", circleSize = "25px", isButton = true, bg = "bgSubtle", ...rest }, ref) => {
    return (
      <Circle
        as={isButton ? "button" : "div"}
        bg={bg} // Background color of the circle
        size={circleSize}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow="md" // Optional: adds shadow for better visibility
        ref={ref} // Ensure ref is properly passed down
        {...rest}
      >
        <Text fontSize={textSize}>{isNumber(text) ? text : getInitials(text)}</Text>
      </Circle>
    );
  }
);

const sizeMap = {
  sm: "25",
  md: "30",
  lg: "40",
};

// OverlappingCircles component to render multiple overlapping circles
export const OverlappingCircles = React.forwardRef(
  function OverlappingCircles({ data, size = "sm", ...rest }, ref) {
    const overlapFactor = 0.75; // 75% overlap
    const length = data.length;
    const [isHovered, setIsHovered] = useState(false);

    const circleSize = `${sizeMap[size]}px`;

    return length > 1 ? (
      <Box
        position="relative"
        display="flex"
        alignItems="center"
        width={circleSize}
        style={{
          zIndex: isHovered ? 100 : 1,
          transition: "z-index 0.3s ease-in-out"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {data.map(({ text, label }, index) => (
          <Tooltip key={index} label={label} placement="top" hasArrow>
            <motion.div
              initial={{ left: 0, opacity: index === 0 ? 1 : 0 }}
              animate={{
                left: isHovered ? `${index * sizeMap[size] * overlapFactor}px` : "0px",
                opacity: 1,
              }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              style={{
                position: "absolute",
                zIndex: length - index, // Ensures the first circle stays on top
              }}
            >
              <CircleText
                text={text}
                boxShadow="0 0 0 2px alphaWhite"
                pointerEvents="auto"
                bg="bgSubtle"
                circleSize={circleSize}
                ref={ref}
                {...rest}
              />
            </motion.div>
          </Tooltip>
        ))}
      </Box>
    ) : (
      <Tooltip label={data[0].label} placement="top" hasArrow>
        <CircleText
          text={data[0].text}
          position="relative"
          circleSize={circleSize}
          ref={ref}
          {...rest}
        />
      </Tooltip>
    );
  }
);
