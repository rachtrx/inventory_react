import { Box, Button, Circle, Tooltip } from "@chakra-ui/react";
import { ResponsiveText } from "./ResponsiveText";
import React, { useState } from "react";
import { motion } from "framer-motion";


function getInitials(string) {
  const words = string.split(' ');
  const initials = words.map(word => word[0]).join('');
  return initials.slice(0, Math.min(2, initials.length)).toUpperCase();
}

const isNumber = (text) => {
	return !isNaN(text) && !isNaN(parseFloat(text));
  };
  

export const CircleText = React.forwardRef(({ text, label, textSize='sm', circleSize="sm", isButton = true, bg="gray.500", ...rest }, ref) => {

	

	return (
		<Tooltip label={label} placement="top" hasArrow>
			<Circle
				as={isButton ? "button" : "div"}
				bg={bg}  // Background color of the circle
				size={circleSize}
				color="white"  // Text color
				display="flex"
				alignItems="center"
				justifyContent="center"
				boxShadow="md"  // Optional: adds shadow for better visibility
				ref={ref}
				{...rest}
			>
				<ResponsiveText size={textSize}>{isNumber(text) ? text : getInitials(text)}</ResponsiveText>
			</Circle>
		</Tooltip>
  );
})

const sizeMap = {
	'sm': '25',
	'md': '30',
	'lg': '40'
}

export const OverlappingCircles = ({ data, size='sm', ...rest }) => {
	const overlapFactor = 0.75; // 75% overlap
	const length = data.length;
	const [isHovered, setIsHovered] = useState(false);

	const circleSize = `${sizeMap[size]}px`
  
	return length > 1 ? (
		<Box 
		position="relative" 
		display="flex" 
		alignItems="center" 
		width={circleSize}
		onMouseEnter={() => setIsHovered(true)} 
		onMouseLeave={() => setIsHovered(false)}
	  >
		{data.map(({ text, label }, index) => (
		  <motion.div
			key={index}
			initial={{ left: 0, opacity: index === 0 ? 1 : 0 }} // All start at the first position
			animate={{
			  left: isHovered ? `${index * sizeMap[size] * overlapFactor}px` : "0px", // Move out on hover
			  opacity: 1, // Ensure all become visible smoothly
			}}
			transition={{ duration: 0.3, delay: index * 0.05 }} // Stagger effect
			style={{
			  position: "absolute",
			  zIndex: length - index, // First stays on top
			}}
		  >
			<CircleText
			  text={text}
			  label={label}
			  boxShadow="0 0 0 2px white"
			  pointerEvents="auto"
			  _groupHover={{ boxShadow: "0 0 0 2px gray.100" }}
			  bg="gray.600"
			  circleSize={circleSize}
			  {...rest}
			/>
		  </motion.div>
		))}
	  </Box>
	) : (
	  <CircleText
		text={data[0].text}
		label={data[0].label}
		position="relative"
		circleSize={circleSize}
		{...rest}
	  />
	);
  };
  