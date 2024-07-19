import { Box } from "@chakra-ui/react";
import { useDrawer } from "../../context/DrawerProvider";
import { useModal } from "../../context/ModalProvider";
import { ResponsiveText } from "../utils/ResponsiveText";

export const SplitReturnButton = ({ item, onMouseEnterFn = () => null, onMouseLeaveFn = () => null }) => {

	const { handleItemClick } = useDrawer()
	const { setFormType } = useModal()

	return (
		<Box
			display="flex"
			w="100%"
			bg="blue.50"
			borderRadius="md"
			overflow="hidden"
			_hover={{
				bg: 'blue.100',
				cursor: 'pointer',
			}}
			onMouseEnter={onMouseEnterFn}
			onMouseLeave={onMouseLeaveFn}
		>
			<Box
				as="button"
				onClick={(e) => {
					e.stopPropagation();
					handleItemClick(item);
				}}
				flex="1"
				p={2}
				_hover={{
					bg: 'blue.200',
					cursor: 'pointer',
				}}
				_active={{ bg: 'blue.250' }}
			>
				<ResponsiveText>{item.assetTag || item.name}</ResponsiveText>
			</Box>
			<Box
				as="button"
				onClick={(e) => {
					e.stopPropagation();
					setFormType('returnAsset')}
				}
				bg="orange.100"
				borderLeft="1px solid white"
				p={2}
				_hover={{
					bg: 'orange.200',
					cursor: 'pointer',
				}}
				_active={{ bg: 'orange.250' }}
			>
				<ResponsiveText>Return</ResponsiveText>
			</Box>
		</Box>
	)
}