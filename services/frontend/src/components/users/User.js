import { Box, Heading, Text, Button, Flex, Link, IconButton, useDisclosure, Grid, SimpleGrid } from '@chakra-ui/react';
import { EditIcon, DownloadIcon, CheckIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { eventToStatus } from '../../config';
import { useDrawer } from '../../context/DrawerProvider';
import { useModal } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../Timeline';
import EditableField from '../utils/EditableField';

const User = ({ user }) => {
	const { editKey, editedValue, handleItemClick, handleSave, handleEdit, handleChange } = useDrawer()
  const { setFormType } = useModal()
    
    return (
			<Box p={4}>
			<Box mb={4}>
				<Heading as="h1" size="lg" mb={4}>{user.name}</Heading>
				<Grid
					templateColumns="auto 1fr auto"
					gap={1}
					p={4}
					alignItems='center'
				>
					<EditableField
						label="Name"
						fieldKey="name"
						value={user.name}
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
				<SimpleGrid columns={3} spacing={4}>
					{user.pastAssets?.map((asset) => (
						<Button key={asset.id} onClick={() => handleItemClick(asset)} colorScheme="blue">
							{asset.assetTag} - {asset.variant}
						</Button>
					))}
				</SimpleGrid>
			</Box>
		
			<Box mb={4}>
				<Heading as="h2" size="md" mb="2">CURRENT ASSETS</Heading>
				{user.currentAssets?.map((asset) => (
					<Flex alignItems="center" mb="2">
						<Button onClick={() => handleItemClick(asset)} colorScheme="blue">
							{asset.assetTag} - {asset.variant}
						</Button>
						<ActionButton bg="orange.100" onClick={() => setFormType('returnAsset')}>
							Return
						</ActionButton>
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
					<Button onClick={() => setFormType('resign')} data-user-id={user.id} colorScheme="red">
						Resign
					</Button>
					<Button onClick={() => setFormType('loanDevice')} data-user-id={user.id} colorScheme="green">
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