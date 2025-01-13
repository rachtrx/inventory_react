import { ButtonGroup, Button, Box } from "@chakra-ui/react";
import { useState } from "react";

const ThreeWaySwitch = ({ options, onChange }) => {
    const [selected, setSelected] = useState(options[0]);
  
    const handleClick = (option) => {
      setSelected(option);
      if (onChange) onChange(option);
    };
  
    return (
      <Box>
        <ButtonGroup isAttached>
          {options.map((option) => (
            <Button
              key={option}
              onClick={() => handleClick(option)}
              colorScheme={selected === option ? "teal" : "gray"}
            >
              {option}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    );
  };

export default ThreeWaySwitch;