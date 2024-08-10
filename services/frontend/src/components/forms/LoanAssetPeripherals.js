import { useEffect, useState } from "react"
import { PeripheralSearchFormControl, SingleSelectFormControl } from "./utils/SelectFormControl"
import { useFormModal } from "../../context/ModalProvider"
import { useUI } from "../../context/UIProvider"
import peripheralService from "../../services/PeripheralService"
import { Button, Flex, VStack, IconButton, Box, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverCloseButton, PopoverBody } from "@chakra-ui/react";
import { MdRemoveCircleOutline, MdSave } from 'react-icons/md';
import { FieldArray } from "formik"
import InputFormControl from "./utils/InputFormControl"
import { ResponsiveText } from "../utils/ResponsiveText"
import { useFormikContext } from 'formik';

export const addNewPeripheral = () => ({
	'id': '',
	'count': null,
})

const handleRecommend = async (callback) => {
    try {
        const response = await callback();
        console.log(response.data);
        // Handle the response, show a notification, etc.
    } catch (error) {
        console.error(error);
        // Handle the error, show an error message, etc.
    }
};

export const LoanAssetPeripherals = function({ fieldArrayName, assetIndex, peripherals }) {

    const [ option, setOption ] = useState(null)

    const {assetOptions, handleAssetInputChange} = useFormModal()
	const { loading, setLoading, handleError } = useUI();
    const { setFieldValue } = useFormikContext();

    useEffect(() => {
        if (!option?.value) return;
		const fetchItems = async () => {
		  setLoading(true);
		  try {
			const response = await peripheralService.getSuggestedPeripherals(option.value);
			const asset = response.data;

            console.log(asset);  

            // Combine both arrays
            const peripheralsArr = [
                ...(asset?.AssetTypeVariant?.VariantPeripherals || []),
                ...(asset?.AssetTypeVariant?.AssetType?.AssetTypePeripherals || [])
            ];
            

            if (peripheralsArr.length === 0) {
                setFieldValue(`${fieldArrayName}.${assetIndex}.peripherals`, []);
                return;
            }
        
            // Remove duplicates based on the peripheralTypeId
            const uniquePeripherals = peripheralsArr.filter((peripheral, index, self) =>
                index === self.findIndex((p) => p.PeripheralType.id === peripheral.PeripheralType.id)
            );
        
            // Map to the desired structure
            const newPeripherals = uniquePeripherals.map((match) => ({
                id: match.PeripheralType.id,
                peripheralName: match.PeripheralType.peripheralName,
                availableCount: match.PeripheralType.availableCount
            }));

			console.log(newPeripherals.slice(1, 10));
			setFieldValue(`${fieldArrayName}.${assetIndex}.peripherals`, newPeripherals);
		  } catch (err) {
			handleError(err);
			console.error(err);
		  } finally {
			setLoading(false);
		  }
		};
	
		fetchItems();
	}, [option, setLoading, handleError, setFieldValue, assetIndex, fieldArrayName]);

    return (
        <>
            <SingleSelectFormControl
                name={`${fieldArrayName}.${assetIndex}.asset-id`} 
                onInputChange={handleAssetInputChange}
                callback={(newOption) => {
                    if (option && newOption.value === option.value) return;
                    setOption(newOption);
                }}
                label={`Asset Tag #${assetIndex + 1}`}
                options={assetOptions} 
                placeholder="Asset Tag"
            />
            <FieldArray name={`${fieldArrayName}.${assetIndex}`}>
                {peripheralHelpers => (
                    <Box>
                        {peripherals.length > 0 && peripherals.map((peripheral, index, array) => (
                            <Flex key={index} gap={4} alignItems="flex-start">
                                <PeripheralSearchFormControl
                                    name={`${fieldArrayName}.${assetIndex}.peripherals.${index}.id`}
                                />
                                <InputFormControl
                                    name={`${fieldArrayName}.${assetIndex}.peripherals.${index}.count`} 
                                    type="number" 
                                    placeholder="Enter count" 
                                />
                                <UpdatePeripheralWithSuggestion
                                    peripheralHelpers={peripheralHelpers}
                                    peripheral={peripheral}
                                    index={index}
                                    option={option}
                                />
                            </Flex>
                        ))}
                        <Flex alignSelf="flex-end" gap={2} marginBottom={4}>
                            <Button mt={4} type="button" onClick={() => peripheralHelpers.push(addNewPeripheral())}>
                                <ResponsiveText>Add Peripheral</ResponsiveText>
                            </Button>
                        </Flex>
                    </Box>
                )}
            </FieldArray>
        </>
    )
}

const UpdatePeripheralWithSuggestion = function({peripheralHelpers, peripheral, index, option}) {

    const { loading, setLoading, handleError } = useUI();
    const [ isPopoverOpen, setIsPopoverOpen ] = useState(false);
    const [ saved, setSaved ] = useState(false)

    const [isVariant, setIsVariant] = useState(null);
    const [isAssetType, setIsAssetType] = useState(null)

    const checkStatus = async (assetId, peripheralId) => {
        setLoading(true);
        setIsPopoverOpen(false);
        try {
            const response = await peripheralService.getSuggestedPeripherals(assetId); // Replace with your API endpoint
            const asset = response.data;

            if (asset.AssetTypeVariant.VariantPeripherals?.some((variantPeripheral) => variantPeripheral.id === peripheralId)) {
                setIsVariant(true)
            }

            if (asset.AssetTypeVariant.AssetType?.AssetTypePeripherals?.some((assetTypePeripheral) => assetTypePeripheral.id === peripheralId)) {
                setIsAssetType(true)
            }

            if (saved && !isVariant && !isAssetType) {
                setIsPopoverOpen(false);
                peripheralHelpers.remove(index);
            } else if (saved && isVariant && isAssetType) {
                setIsPopoverOpen(false);
            } else setIsPopoverOpen(true);

        } catch (error) {
            console.error("Failed to fetch content:", error);
            handleError("Failed to fetch content")
        } finally {
            setLoading(false);
        }
    };

    return (
        <Popover isOpen={isPopoverOpen} placement="bottom">
            <PopoverTrigger >
                {saved ? 
                    <IconButton
                        onClick={() => checkStatus(option.value, peripheral.id)}
                        icon={<MdRemoveCircleOutline />}
                        aria-label="Remove Peripheral"
                    /> : 
                    <IconButton
                        icon={<MdSave />}
                        aria-label="Save Peripheral"
                    />
                }
                    
            </PopoverTrigger>
            <PopoverContent width="auto">
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverBody
                    maxHeight={'200px'} // Set the maximum height
                    overflowY={'auto'}  // Enable vertical scrolling
                >
                    {saved ?
                        (
                            <VStack>
                                {isAssetType && <Button
                                    onClick={async () => {
                                        await handleRecommend(peripheralService.updateAssetTypeSuggestion(option.id, peripheral.id, peripheral.saved));
                                        peripheralHelpers.remove(index);
                                    }}
                                    variant="link"
                                >
                                    <ResponsiveText>Don't Recommend for {option.assetType}</ResponsiveText>
                                </Button>}

                                {isVariant && <Button
                                    onClick={async () => {
                                        await handleRecommend(peripheralService.updateVariantSuggestion(option.id, peripheral.id, peripheral.saved));
                                        peripheralHelpers.remove(index);
                                    }}
                                    variant="link"
                                >
                                    <ResponsiveText>Don't Recommend for {option.variantName}</ResponsiveText>
                                </Button>}

                                <Button
                                    onClick={() => peripheralHelpers.remove(index)}
                                    variant="link"
                                >
                                    <ResponsiveText>Only remove this time</ResponsiveText>
                                </Button>
                            </VStack>
                        ) : (
                            <VStack>
                                <Button
                                    onClick={async () => {
                                        await handleRecommend(peripheralService.updateAssetTypeSuggestion(option.id, peripheral.id, peripheral.saved));
                                        setSaved(true);
                                    }}
                                    variant="link"
                                >
                                    <ResponsiveText>Recommend for {option.assetType}</ResponsiveText>
                                </Button>

                                <Button
                                    onClick={async () => {
                                        await handleRecommend(peripheralService.updateVariantSuggestion(option.id, peripheral.id, peripheral.saved));
                                        setSaved(true);
                                    }}
                                    variant="link"
                                >
                                    <ResponsiveText>Recommend for {option.variantName}</ResponsiveText>
                                </Button>

                                <Button
                                    onClick={() => peripheralHelpers.remove(index)}
                                    variant="link"
                                >
                                    <ResponsiveText>Only add this time</ResponsiveText>
                                </Button>
                            </VStack>
                        )}
                    
                </PopoverBody>
            </PopoverContent>
        </Popover>
    )
}