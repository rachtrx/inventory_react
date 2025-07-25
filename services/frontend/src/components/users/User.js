import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure, Grid, SimpleGrid } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, FormType, useFormModal } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import { UserActionButton } from '../buttons/actions/UserActionButton';
import Timeline from '../timeline/Timeline';
import TextEditableField from '../utils/editing/TextEditableField';
import { useEffect } from 'react';
import { AccTypeLink, AssetLink } from '../buttons/ItemLink';
import UserTimeline from '../timeline/users/UserTimeline';
import { ReturnButton } from '../buttons/actions/ReturnButton';
import userService from '../../services/UserService';
import SelectEditableField from '../utils/editing/SelectEditableField';
import { StarButton } from '../buttons/StarButton';
import { ReloanButton } from '../buttons/actions/ReloanButton';
import { EditToggleButton } from '../buttons/EditToggleButton';

const User = ({ user }) => {

	const { updateItem } = useDrawer();

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

	const handleBookmarkUpdate = async (isBookmarked) => {
		await updateItem({ name: 'bookmarked', itemId: user.userId, newValue: !isBookmarked });
	}
    
    return (
			<Box p={4}>
				<Box mb={4}>
					<Flex gap={2} justifyContent="space-between">
						<Flex gap={1}>
							<StarButton
								id={user.userId}
								isBookmarked={user.bookmarked}
								handleUpdate={() => handleBookmarkUpdate(user.bookmarked)}
							/>
							<EditToggleButton/>
						</Flex>
						<TextEditableField
							name="userName"
							value={user.userName}
							isHeading={true}
							textProps={{as:"h1", size:"lg", mb: "4"}}
						/>
					</Flex>
					
					<Grid
						templateColumns="auto 1fr auto"
						gap={1}
						p={4}
						alignItems='center'
					>
						<TextEditableField
							label="Email"
							name="email"
							value={user.email}
						/>
						<SelectEditableField 
							label="Department"
							name="deptName"
							value={user.deptName}
							id={user.deptId}
							createFn={async (value) => await userService.createNewDept(value)}
						/>
					</Grid>
				</Box>
			
				<Box mb={4}>
					<Heading as="h2" size="md" mb="2">PAST ASSETS</Heading>
					<SimpleGrid columns={3} spacing={4}>
						{user.pastAssets?.map((asset) => (
							<Flex gap={1}>
								<AssetLink asset={asset} withTooltip={true}/>
								<AssetActionButton 
									asset={asset}
									formType={FormType.RELOAN}
									user={user}
								/>
							</Flex>
						))}
						
					</SimpleGrid>
				</Box>
			
				<Box mb={4}>
					<Heading as="h2" size="md" mb="2">CURRENT ASSETS</Heading>
					{loans?.map((loan) => (
						<Flex alignItems="center" mb="2" gap={1}>
							{loan.asset && <AssetLink asset={loan.asset} withTooltip={true}/>}
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
			
				<Flex gridGap="2" mb={4}>
					<UserActionButton 
						formType={FormType.DEL_USER} 
						user={user}
					/>
					<UserActionButton
						formType={FormType.LOAN}
						user={user}
					/>
				</Flex>
			
				{user.history && 
					<UserTimeline
						events={user.history}
					/>
				}
		</Box>
    );
};

export default User;