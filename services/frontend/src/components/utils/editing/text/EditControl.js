import { CheckIcon } from "@chakra-ui/icons"
import { Box, Button, Flex, Input, Textarea } from "@chakra-ui/react"
import { useThemeFontSize } from "../../useThemeFontSize"

export const EditControl = ({ isRemarks, handleUpdate, newValue, value, isFloat, size="md", setNewValue, ...rest }) => {

    const fontSize = useThemeFontSize(size)

    return (
        <Box position="relative" {...rest}>
            {isRemarks ? (
                <Textarea
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    autoFocus
                />) : (
                <Input
                    value={newValue}
                    fontSize={fontSize}
                    onChange={e => setNewValue(e.target.value)}
                    type={isFloat ? "number": undefined}
                    flex="1"
                    autoFocus
                />
            )}
            <Flex
                position="absolute"
                direction="column"
                left="0"
                right="0"
                mt="2"
                style={{ top: '100%' }}
                gap={2}
            >
                <Button
                    leftIcon={<CheckIcon />} 
                    colorScheme="green" 
                    onClick={handleUpdate}
                    alignSelf="start"
                    disabled={newValue === value}
                >
                    Save
                </Button>
            </Flex>
        </Box>
    )
}