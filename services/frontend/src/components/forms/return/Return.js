import { Box, Button, Divider, Flex, IconButton, Spacer, Tooltip, VStack } from "@chakra-ui/react"
import { FieldArray, useFormikContext } from "formik"
import { ResponsiveText } from "../../utils/ResponsiveText"
import React, { useEffect } from "react"
import { AddButton, RemoveButton } from "../utils/ItemButtons"
import { useLoan } from "../../../context/LoanProvider"
import { FaUser, FaUsers } from "react-icons/fa"
import { SearchSingleSelectFormControl } from "../utils/SelectFormControl"
import { useFormModal } from "../../../context/ModalProvider"
import { v4 as uuidv4 } from 'uuid';
import DateInputControl from "../utils/DateInputControl"
import { useReturn } from "../../../context/ReturnProvider"
import ReturnPeripherals from "./ReturnPeripherals"

const createNewUser = (user) => ({
	'key': uuidv4(),
	'userId': user.userId || '',
	'userName': user.userName || '',
    'peripherals': user.peripherals || []
})

export const createNewReturn = (asset=null, users=[]) => ({
	'key': uuidv4(),
	'assetId': asset?.assetId || '',
	'assetTag': asset?.assetTag || '',
	'users': users.map(user => createNewUser(user)),
	'remarks': ''
})

export const Return = () => {

	const { ret, returnIndex, assetOption } = useReturn();
	const { handleAssetSearch, handleUserSearch } = useFormModal();

	return (
		<Box position='relative'>
			<Flex direction="column" key={ret.key}>
				<SearchSingleSelectFormControl
					name={`returns.${returnIndex}.asset.assetId`}
					searchFn={value => handleAssetSearch(value)}
					secondaryFieldsMeta={[
						{name: `loans.${returnIndex}.asset.assetTag`, attr: 'assetTag'},
					]}
					label={`Asset Tag`}
					placeholder="Asset Tag"
					initialOptions={assetOption}
					initialOption={assetOption}
				/>
				<ReturnPeripherals/>
			</Flex>
		</Box>
	);
}