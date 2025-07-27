import { Box, Heading, Flex, Grid, SimpleGrid, Text } from '@chakra-ui/react';
import { useDrawer } from '../../context/DrawerProvider';
import { FormType } from '../../context/ModalProvider';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import { UserActionButton } from '../buttons/actions/UserActionButton';
import { TextEditableField, HeadingEditableField } from '../utils/editing/text/TextEditableField';
import { useEffect } from 'react';
import { AccTypeLink, AssetLink } from '../buttons/ItemLink';
import UserTimeline from '../timeline/users/UserTimeline';
import { ReturnButton } from '../buttons/actions/ReturnButton';
import userService from '../../services/UserService';
import SelectEditableField from '../utils/editing/SelectEditableField';
import { StarButton } from '../buttons/StarButton';
import { EditToggleButton } from '../buttons/EditToggleButton';
import DateText from '../timeline/utils/DateText';

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
					<Flex gap={2} justifyContent="center">
						<Flex gap={1}>
							<StarButton
								id={user.userId}
								isBookmarked={user.bookmarked}
								handleUpdate={() => handleBookmarkUpdate(user.bookmarked)}
							/>
							<EditToggleButton/>
						</Flex>
						<HeadingEditableField
							name="userName"
							value={user.userName}
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

						{user.addEvent ? (
							<>
								<Text fontSize="md">Added Date:</Text>
								<DateText colorScheme={"green"} event={user.addEvent}/>
							</>
						) : undefined}
						{user.deleteEvent ? (
							<>
								<Text fontSize="md">Condemned Date:</Text>
								<DateText colorScheme={"red"} event={user.deleteEvent}/>
							</>
						) : undefined}
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