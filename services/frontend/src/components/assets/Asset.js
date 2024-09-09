import { Box, Heading, Text, Button, Flex, IconButton, SimpleGrid, Grid, VStack, HStack } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, formTypes, useFormModal } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../Timeline';
import EditableField from '../utils/EditableField';
import { ResponsiveText } from '../utils/ResponsiveText';
import { ItemLink } from '../buttons/ItemLink';
import { AssetActionButton, UserActionButton } from '../buttons/SplitButton';

const Asset = ({ asset }) => {
  const { editKey, editedValue, handleItemClick, handleSave, handleEdit, handleChange } = useDrawer()
  const { setFormType } = useFormModal()

  const currentUsers = asset.users?.filter(user => !user.returnDate);
  const pastUsers = asset.users?.filter(user => user.returnDate);
  const reservedUsers = asset.users?.filter(user => user.reserveDate && !user.cancelDate && !user.loanDate);

	return (
		<Box p={4}>
      <Box mb={4}>
        <Heading as="h1" size="lg" mb={4}>{asset.assetTag}</Heading>
				<Heading as="h2" size="md" mb="2">Status: {asset.status}</Heading>	

        <Flex justifyContent='space-between'>
        <ResponsiveText size='lg'>Peripherals</ResponsiveText>
          <HStack>
          {asset.peripherals?.map((peripheral) => (
            <ResponsiveText>{peripheral.name}</ResponsiveText>
          ))}
          </HStack>
        <ActionButton
          formType={formTypes.TAG}
          item={asset}
        />
        </Flex>

        <Grid
					templateColumns="auto 1fr auto"  // First column takes up as much space as possible, second column takes up as little space as necessary
					gap={1}  // This is the spacing between columns
					p={4}
					alignItems='center'
				>
					{/* IMPT: field key must be the same as value */}
          <EditableField 
						label="Serial Number"
            fieldKey="serialNumber"
            value={asset.serialNumber}
            handleSave={handleSave}
					/>
					<EditableField 
						label="Model"
            fieldKey="variant"
            value={asset.variant}
            handleSave={handleSave}
					/>
					<EditableField 
						label="Asset Type"
            fieldKey="assetType"
            value={asset.assetType}
            handleSave={handleSave}
					/>
					<EditableField 
						label="Vendor"
            fieldKey="vendor"
            value={asset.vendor}
            handleSave={handleSave}
					/>
          <EditableField
            label="Value"
            fieldKey="value"
            value={asset.value}
            handleSave={handleSave}
          />
          <EditableField
            label="Location"
            fieldKey="location"
            value={asset.location}
            handleSave={handleSave}
          />
        </Grid>
      </Box>

      <Flex mb={4} gap={4}>
        <Flex direction="column">
          <Heading as="h2" size="md" mb="2">
            {asset.shared ? 'Current Users: ' : 'Current User: '}
          </Heading>
          {currentUsers?.map(user => (
            <>
              <ItemLink key={user.id} isCopy={false} item={user} />
              <ActionButton key={formTypes.RETURN} formType={formTypes.RETURN} item={asset} />
            </>
          ))}
        </Flex>

        <Flex direction="column">
          <Heading as="h2" size="md" mb="2">Past Users:</Heading>
          {pastUsers?.map(user => (
            <ItemLink key={user.id} isCopy={false} item={user} />
          ))}
        </Flex>

        <Flex direction="column">
          <Heading as="h2" size="md" mb="2">Reserved for:</Heading>
          {reservedUsers?.map(user => (
            <ItemLink key={user.id} isCopy={false} item={user} />
          ))}
        </Flex>
      </Flex>

      <Box>
        <IconButton
          icon={<InfoOutlineIcon />}
          isRound
          aria-label="Bookmark"
          mb={4}
        />
        {asset.status !== 'condemned' && asset.status !== 'loaned' && (
          <Flex gridGap="2">
            <Button onClick={() => setFormType(formTypes.DEL_ASSET)} colorScheme="red">
              CONDEMN
            </Button>
            <Button onClick={() => setFormType(formTypes.LOAN)} data-asset-id={asset.id} colorScheme="green">
              LOAN
            </Button>
          </Flex>
        )}
      </Box>

			{asset.events && 
				<Timeline 
					events={asset.events} 
				/>
			}
		</Box>
	);
}

export default Asset;
