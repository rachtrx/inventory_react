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
    IconButton,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useItems } from '../../context/ItemsProvider';
import { useFormikContext } from 'formik';
import { FaSearch } from 'react-icons/fa';

const FilterSidebar = ({ isOpen, onClose, children }) => {
    const { setPage } = useItems()
    const { values, handleSubmit, resetForm } = useFormikContext();

    useEffect(() => {
        console.log(values)
    }, [values])
    const btnRef = useRef();

    return (
        <>
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
                            <Button 
                                colorScheme="blue" 
                                onClick={(values) => {
                                    setPage(1);
                                    handleSubmit(values);
                                    onClose();
                                }} 
                                w="full">
                                Search
                            </Button>
                            <Button 
                                colorScheme="gray" 
                                onClick={(e) => {
                                    e.preventDefault();
                                    resetForm();
                                }} 
                                variant="outline" 
                                w="full">
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
