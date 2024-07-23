import { Button, Circle, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Tooltip } from "@chakra-ui/react";
import { ResponsiveText } from "./ResponsiveText";
import React from "react";

function getInitials(string) {
  const words = string.split(' ');
  const initials = words.map(word => word[0]).join('');
  return initials.slice(0, Math.min(2, initials.length)).toUpperCase();
}

export const CircleInitials = React.forwardRef(({ text, size = 'sm', isButton = true, ...rest }, ref) => {

	const sizeMap = {
		'sm': '25px',
		'md': '30px',
		'lg': '40px'
	}

	return (
    <Circle
		as={isButton ? "button" : "div"}
		size={sizeMap[size]}  // Diameter of the circle
		bg="gray.500"  // Background color of the circle
		color="white"  // Text color
		display="flex"
		alignItems="center"
		justifyContent="center"
		boxShadow="md"  // Optional: adds shadow for better visibility
		ref={ref}
		{...rest}
	>
		<ResponsiveText>{getInitials(text)}</ResponsiveText>
	</Circle>
  );
})

  