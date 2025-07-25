import { useEffect, useState } from "react"
import loanService from "../../../services/LoanService";
import { useLoans } from "./LoansProvider";
import { Badge, Box, VStack } from "@chakra-ui/react";
import { createNewAccessory } from "./helpers";
import { useUI } from "../../../context/UIProvider";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { formatDistanceToNow } from 'date-fns';

export const SuggestedAccessories = ({ sTypeId, accessoryHelpers }) => {

    const { sTypeAccMap, setSTypeAccMap, setAccessoryOptions } = useLoans();
    const [ options, setOptions ] = useState([]);
    const { handleError } = useUI();

    useEffect(() => {
        if (sTypeId in sTypeAccMap) {
            setOptions(sTypeAccMap[sTypeId]);
            return;
        }

        const fetchPrevLoanedAccessories = async () => {
            try {
                const response = await loanService.fetchSuggestedAccessories(sTypeId);
                const uniqueCombinations = response.data;
                console.log(uniqueCombinations);

                setSTypeAccMap(prevMap => ({
                    ...prevMap,
                    [sTypeId]: uniqueCombinations
                }));

                setOptions(uniqueCombinations);

                // Flatten and deduplicate accessory types by accessoryTypeId
                const allAccessories = uniqueCombinations.flatMap(combination => combination);

                const deduplicatedOptions = Array.from(
                    new Map(
                        allAccessories.map(acc => [
                            acc.accessoryTypeId,
                            {
                                accessoryTypeId: acc.accessoryTypeId,
                                accessoryName: acc.accessoryName,
                                stock: acc.stock,
                                value: acc.accessoryName,
                                label: acc.accessoryName,
                            }
                        ])
                    ).values()
                );

                setAccessoryOptions(oldArray => [
                    ...oldArray,
                    ...deduplicatedOptions
                ]);
            } catch (err) {
                handleError(err);
                console.error(err);
            }
        }
        fetchPrevLoanedAccessories();
    }, [sTypeId, sTypeAccMap, setSTypeAccMap, setOptions, handleError, setAccessoryOptions])

    const onClick = (option) => {
        for (const accType of option) {
            accessoryHelpers.push(createNewAccessory(accType))
        }
    }

    useEffect(() => {
        console.log(options);
    }, [options])

    return (
        options?.length ? (
            <VStack>
                {options.map((option, idx) => (
                    <Box
                        as="button"
                        onClick={() => onClick(option)}
                        w="100%"
                        textAlign="left"
                        borderWidth="1px"
                        borderRadius="md"
                        p={4}
                        _hover={{ bg: 'gray.50' }}
                        transition="background-color 0.2s"
                    >
                        <VStack align="start" spacing={1}>
                        <ResponsiveText fontWeight="medium">
                            {option.map(accType => `${accType.accessoryName} x${accType.count}`).join(", ")}
                        </ResponsiveText>
                        <Badge colorScheme="blue">
                            {formatDistanceToNow(new Date(option[0].eventDate), { addSuffix: true })}
                        </Badge>
                        </VStack>
                    </Box>
                ))}
            </VStack>
        ) : undefined
    )
}