import { Box, Button } from '@chakra-ui/react';
import { ACTION_COLORS, ACTION_TEXT } from './constants';
import { actionTypes, useFormModal } from '../../context/ModalProvider';
import { ResponsiveText } from '../utils/ResponsiveText';
import { createNewReturn } from '../forms/asset/return/ReturnSearch';

const ActionButton = ({ 
	formType,
	initialValues, 
	borderRadius="md",
	isMulti=false,
	...rest
}) => {
	console.log(formType);
	const bg = ACTION_COLORS[formType];
	const text = ACTION_TEXT[formType];
	const { setFormType, setInitialValues } = useFormModal();

	return (
		<Box
			as="button"
			onClick={(e) => {
				setInitialValues(initialValues);
				setFormType(formType);
			}}
			bg={bg}
			borderRadius={borderRadius}
			p={2}
			_hover={{
				bg: `${bg.split('.')[0]}.200`,
				cursor: 'pointer',
			}}
			_active={{ bg: `${bg.split('.')[0]}.250` }}
			{...rest}
		>
			<ResponsiveText>{text}{initialValues.length > 1 && ' All'}</ResponsiveText>
		</Box>
	);
};

const AssetActionButton = ({
	asset=null,
	...rest
}) => {

	const assetArray = !asset ? [] : Array.isArray(asset) ? asset : [asset]

	return (
		<ActionButton
			initialValues={assetArray.map(ast => ({assetId: ast.assetId, serialNumber: ast.serialNumber}))}
			{...rest}
		/>
	)
}

export const ReturnAssetButton = ({
	loans=[],
	...rest
}) => {

	return (
		<ActionButton
			initialValues={loans.map(loan => createNewReturn({
				loanId: loan.loanId,
				asset: loan.astLoan.asset || {},
				user: loan.user,
				accLoans: loan.accLoans,
			}))}
			{...rest}
		/>
	)
}

const UserActionButton = ({
	user=null,
	...rest
}) => {

	const userArray = !user ? [] : Array.isArray(user) ? user : [user]

	return (
		<ActionButton
			initialValues={userArray.map(ast => ({userId: ast.userId, userName: ast.userName}))}
			{...rest}
		/>
	)
}

const AccessoryTypeActionButton = ({
	accType=null,
	...rest
}) => {
	const accTypeArray = !accType ? [] : Array.isArray(accType) ? accType : [accType]

	return (
		<ActionButton
			initialValues={accTypeArray.map(accType => ({
				accessoryTypeId: accType.accessoryTypeId, 
				accessoryName: accType.accessoryName
			}))}
			{...rest}
		/>
	)
}

const AccessoryLoanActionButton = ({
	accLoan=null,
	...rest
}) => {
	const accLoansArray = !accLoan ? [] : Array.isArray(accLoan) ? accLoan : [accLoan]

	return (
		<ActionButton
			initialValues={accLoansArray.map(accLoan => ({
				accessoryLoanId: accLoan.accessoryLoanId, 
				loan: accLoan.loan
			}))}
			{...rest}
		/>
	)
}

export { 
	AssetActionButton, 
	UserActionButton, 
	AccessoryTypeActionButton, 
	AccessoryLoanActionButton
};