import { Box, Heading, Text, Button, Flex, IconButton, SimpleGrid, Grid, VStack, HStack } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, formTypes, useFormModal } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../Timeline';
import EditableField from '../utils/EditableField';
import { ResponsiveText } from '../utils/ResponsiveText';

const Asset = ({ asset }) => {
  const { editKey, editedValue, handleItemClick, handleSave, handleEdit, handleChange } = useDrawer()
  const { dispatch } = useFormModal()

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

      <Box mb={4}>
        <Heading as="h2" size="md" mb="2">PAST USERS</Heading>
        <SimpleGrid columns={3} spacing={4}>
          {asset.pastUsers?.map((user) => (
            <Button key={user.id} onClick={() => handleItemClick(user)} colorScheme="blue">
              {user.name}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      <Box mb={4}>
        <SimpleGrid columns={2} spacing={10} alignItems="center">
          {asset.status === 'loaned' && (
            <Flex gridGap="2">
              <Text>USER:</Text>
              <Button onClick={() => handleItemClick(asset.user)} colorScheme="blue">
                {asset.user.name}
              </Button>
              <ActionButton bg="orange.100" onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: formTypes.RETURN })}>
                Return
              </ActionButton>
            </Flex>
          )}
        </SimpleGrid>
      </Box>

      <Box>
        <IconButton
          icon={<InfoOutlineIcon />}
          isRound
          aria-label="Bookmark"
          mb={4}
        />
        {asset.status !== 'condemned' && asset.status !== 'loaned' && (
          <Flex gridGap="2">
            <Button onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: formTypes.DEL_ASSET })} colorScheme="red">
              CONDEMN
            </Button>
            <Button onClick={() => dispatch({ type: actionTypes.SET_FORM_TYPE, payload: formTypes.LOAN })} data-asset-id={asset.id} colorScheme="green">
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
