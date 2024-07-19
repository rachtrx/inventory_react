import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import { Grid, Button, Collapse, useDisclosure, Box, Flex, useStyleConfig } from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

const FilterContainer = ({ children }) => {
    const { isOpen, onToggle } = useDisclosure();
    const [mainFilters, setMainFilters] = useState([]);
    const [subFilters, setSubFilters] = useState([]);
    const containerRef = useRef(null);

    const distributeFilters = useCallback(() => {
        if (!containerRef.current) return;
        console.log(containerRef.current.offsetWidth);

        const containerWidth = containerRef.current.offsetWidth;
        
        let usedWidth = 0;

        const main = [];
        const sub = [];

        React.Children.forEach(children, (child) => {
            if (usedWidth + 200 <= containerWidth) {
                main.push(child);
                usedWidth += 210;
            } else {
                sub.push(child);
            }
        });

        setMainFilters(main);
        setSubFilters(sub);
    }, [children]);

    useEffect(() => {
        distributeFilters(); // Initial distribution

        const handleResize = () => {
            distributeFilters(); // Adjust on window resize
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
      }, [distributeFilters]);

    return (
        <Box width="full">
            <Grid ref={containerRef} templateColumns="repeat(auto-fill, 200px)" gap="10px" width="full" mb={4} alignItems="stretch">
                {mainFilters}
            </Grid>
            <Collapse in={isOpen} animateOpacity sx={{ overflow: isOpen ? 'visible' : 'hidden' }}>
                <Grid
                    templateColumns="repeat(auto-fill, 200px)"
                    gap="10px"
                    width="full"
                    mb={4}
                >
                    {subFilters}
                </Grid>
            </Collapse>
            <Flex gap={6}>
                <Button colorScheme="blue" type="submit">Search</Button>
                <Button colorScheme="gray" variant="outline" type="reset">Reset</Button>
                
                { subFilters.length > 0 ?
                    (<Button onClick={onToggle} variant="outline" aria-label={isOpen ? "Hide Filters" : "Show Filters"}>
                        {isOpen ? <ChevronUpIcon mr={2} /> : <ChevronDownIcon mr={2} />}
                        {isOpen ? "Less Filters" : "More Filters"}
                    </Button>) : '' }
            </Flex>
        </Box>
    );
};

export default FilterContainer;
