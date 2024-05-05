import { 
    Flex,
    ButtonGroup
} from "@chakra-ui/react"

export default function ActionsGroup({children, label}) {

    return (
        <Flex alignItems="center" justifyContent="space-between" p="10px">
            <ButtonGroup spacing={4}>
                {children}
            </ButtonGroup>
            <h5>{label} Found</h5>
        </Flex>
    )
}