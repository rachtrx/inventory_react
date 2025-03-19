import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure, Grid, SimpleGrid } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, FormType, useFormModal } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import { UserActionButton } from '../buttons/actions/UserActionButton';
import Timeline from '../timeline/Timeline';
import EditableField from '../utils/EditableField';
import { useEffect } from 'react';
import { AccTypeLink, AssetLink } from '../buttons/ItemLink';
import UserTimeline from '../timeline/users/UserTimeline';
import { ReturnButton } from '../buttons/actions/ReturnButton';

const User = ({ user }) => {
	const { editKey, editedValue, handleSave, handleEdit, handleChange } = useDrawer()
  	const { setFormType } = useFormModal()

	const loans = user.loans.map(loan => ({
		loanId: loan.loanId,
		asset: loan.astLoan?.asset,
		accessories: loan.accLoans?.filter(accLoan => accLoan.unreturned > 0).map(accLoan => ({
            ...accLoan.accType, // ignores accLoan.accReturns
            unreturned: accLoan.unreturned,
		}))
	})).filter(loan => loan.asset || loan.accessories?.length)

	console.log(loans);

	useEffect(() => {
		console.log(user);
	}, [user])
    
    return (
			<Box p={4}>
			<Box mb={4}>
				<Heading as="h1" size="lg" mb={4}>{user.userName}</Heading>
				<Grid
					templateColumns="auto 1fr auto"
					gap={1}
					p={4}
					alignItems='center'
				>
					<EditableField
						label="Name"
						fieldKey="name"
						value={user.userName}
						handleSave={handleSave}
					/>
					<EditableField 
						label="Department"
						fieldKey="department"
						value={user.deptName}
						handleSave={handleSave}
					/>
				</Grid>
			</Box>
		
			<Box mb={4}>
				<Heading as="h2" size="md" mb="2">PAST ASSETS</Heading>
				<SimpleGrid columns={3} spacing={4}>
					{user.pastAssets?.map((asset) => (
						<AssetLink asset={asset}/>
					))}
				</SimpleGrid>
			</Box>
		
			<Box mb={4}>
				<Heading as="h2" size="md" mb="2">CURRENT ASSETS</Heading>
				{loans?.map((loan) => (
					<Flex alignItems="center" mb="2">
						{loan.asset && <AssetLink asset={loan.asset}/>}
						{loan.accessories?.length > 0 && (
							loan.accessories.map((accessory) => (
								<AccTypeLink key={accessory.accessoryTypeId} accType={accessory} />
							))
						)}
						<ReturnButton 
							loanId={loan.loanId}
						/>
					</Flex>
				))}
			</Box>
		
			<Box>
				<IconButton
					icon={<InfoOutlineIcon />}
					isRound
					aria-label="Bookmark"
					mb={4}
				/>
				<Flex gridGap="2">
					<UserActionButton 
						formType={FormType.DEL_USER} 
						user={user}
					/>
					<UserActionButton
						formType={FormType.LOAN}
						user={user}
					/>
				</Flex>
			</Box>
		
			{user.history && 
				<UserTimeline
					events={user.history}
				/>
			}
		</Box>
    );
};

export default User;