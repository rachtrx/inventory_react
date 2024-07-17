import { Text } from "@chakra-ui/react"
import { useResponsive } from "../../context/ResponsiveProvider"

export const ResponsiveText = ({props, children}) => {

    const { textSize } = useResponsive()

    return (
        <Text fontSize={textSize} {...props}>
            {children}
        </Text>
    )
}