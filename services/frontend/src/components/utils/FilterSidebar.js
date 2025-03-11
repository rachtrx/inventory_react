import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Button,
    Drawer,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Grid,
    Flex,
    useDisclosure,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const FilterSidebar = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef();

    return (
        <>
            {/* Button to open sidebar */}
            <Button
                ref={btnRef}
                onClick={onOpen}
                colorScheme="blue"
                position="fixed"
                left="10px"
                top="50%"
                transform="translateY(-50%)"
                zIndex="1000"
            >
                <ChevronRightIcon mr={2} /> Filters
            </Button>

            {/* Sidebar Drawer */}
            <Drawer
                isOpen={isOpen}
                placement="left"
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent maxW="300px">
                    <DrawerHeader>
                        Filters
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            position="absolute"
                            right="10px"
                        >
                            <ChevronLeftIcon />
                        </Button>
                    </DrawerHeader>

                    <DrawerBody>
                        <Grid templateColumns="1fr" gap="10px">
                            {children}
                        </Grid>
                    </DrawerBody>

                    <DrawerFooter>
                        <Flex w="full" gap={4}>
                            <Button colorScheme="blue" type="submit" w="full">
                                Search
                            </Button>
                            <Button colorScheme="gray" variant="outline" type="reset" w="full">
                                Reset
                            </Button>
                        </Flex>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default FilterSidebar;
