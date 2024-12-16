import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure, Grid, SimpleGrid } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, formTypes, useFormModal } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../timeline/Timeline';
import EditableField from '../utils/EditableField';
import { useEffect } from 'react';

const User = ({ user }) => {
	const { editKey, editedValue, handleItemClick, handleSave, handleEdit, handleChange } = useDrawer()
  	const { setFormType } = useFormModal()

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
						value={user.department}
						handleSave={handleSave}
					/>
				</Grid>
			</Box>
		
			<Box mb={4}>
				<Heading as="h2" size="md" mb="2">PAST ASSETS</Heading>
				<SimpleGrid columns={3} gap={4}>
					{user.pastAssets?.map((asset) => (
						<Button key={asset.assetId} onClick={() => handleItemClick(asset)} colorPalette="blue">
							{asset.assetTag} - {asset.subTypeName}
						</Button>
					))}
				</SimpleGrid>
			</Box>
		
			<Box mb={4}>
				<Heading as="h2" size="md" mb="2">CURRENT ASSETS</Heading>
				{user.currentAssets?.map((asset) => (
					<Flex alignItems="center" mb="2">
						<Button onClick={() => handleItemClick(asset)} colorPalette="blue">
							{asset.assetTag} - {asset.subTypeName}
						</Button>
						<ActionButton bg="orange.100" onClick={() => setFormType(formTypes.RETURN)}>
							Return
						</ActionButton>
					</Flex>
				))}
			</Box>
		
			<Box>
				<IconButton
					icon={<FiInfo />}
					isRound
					aria-label="Bookmark"
					mb={4}
				/>
				<Flex gridGap="2">
					<Button onClick={() => setFormType(formTypes.DEL_USER)} colorPalette="red">
						Resign
					</Button>
					<Button onClick={() => setFormType(formTypes.LOAN)} colorPalette="green">
						Loan Device
					</Button>
				</Flex>
			</Box>
		
			{user.events && 
				<Timeline 
					events={user.events}
				/>
			}
		</Box>
    );
};

export default User;