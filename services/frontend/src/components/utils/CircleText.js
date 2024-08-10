import { Box, Button, Circle } from "@chakra-ui/react";
import { ResponsiveText } from "./ResponsiveText";
import React from "react";
import { Tooltip } from "chart.js";

function getInitials(string) {
  const words = string.split(' ');
  const initials = words.map(word => word[0]).join('');
  return initials.slice(0, Math.min(2, initials.length)).toUpperCase();
}

const isNumber = (text) => {
	return !isNaN(text) && !isNaN(parseFloat(text));
  };
  

export const CircleText = React.forwardRef(({ text, size = 'sm', isButton = true, bg="gray.500", ...rest }, ref) => {

	const sizeMap = {
		'sm': '25px',
		'md': '30px',
		'lg': '40px'
	}

	return (
	
		<Circle
			as={isButton ? "button" : "div"}
			size={sizeMap[size]}  // Diameter of the circle
			bg={bg}  // Background color of the circle
			color="white"  // Text color
			display="flex"
			alignItems="center"
			justifyContent="center"
			boxShadow="md"  // Optional: adds shadow for better visibility
			ref={ref}
			{...rest}
		>
			<ResponsiveText>{isNumber(text) ? text : getInitials(text)}</ResponsiveText>
		</Circle>
  );
})

export const OverlappingCircles = ({ children }) => {
	return (
		<Box position="relative" display="flex" alignItems="center">
			{children.map((child, index) => (
				<Box
					key={index}
					position="absolute"  // Positioning the circles absolutely
					left={`${index * 20}px`}  // Adjust this value to control the overlap
					zIndex={index}  // Controls stacking order
				>
					{child}
				</Box>
			))}
		</Box>
	);
  };
  