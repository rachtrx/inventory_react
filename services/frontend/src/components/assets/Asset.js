import { Box, Heading, Text, Button, Flex, IconButton, SimpleGrid, Grid, VStack, HStack } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, formTypes, useFormModal } from '../../context/ModalProvider';
import ActionButton from '../buttons/ActionButton';
import Timeline from '../timeline/Timeline';
import EditableField from '../utils/EditableField';
import { ResponsiveText } from '../utils/ResponsiveText';
import { ItemLink } from '../buttons/ItemLink';
import { AssetActionButton, UserActionButton } from '../buttons/SplitButton';
import { AssetStatus } from '../../constants/AssetStatus';

const Asset = ({ asset }) => {
  const { editKey, editedValue, handleItemClick, handleEdit, handleChange } = useDrawer()
  const { setFormType } = useFormModal()

  const currentUsers = asset.currentUsers;
  const pastUsers = asset.pastUsers;
  const reservedUsers = asset.reservedUsers;

  const status = asset.delEventId ? AssetStatus.DELETED : 
    asset.currentUsers && asset.currentUsers.length > 0 ? AssetStatus.LOANED : 
    asset.reservedUsers && asset.reservedUsers.length > 0 ? AssetStatus.RESERVED : 
    AssetStatus.AVAILABLE;

	return (
		<VStack align="stretch" p={4} gap={2}>
      <Box mb={4}>
        <Heading as="h1" size="lg" mb={4}>{asset.assetTag}</Heading>
				<Heading as="h2" size="md" mb="2">Status: {AssetStatus.toString(status)}</Heading>	

        <Grid
					templateColumns="auto 1fr auto"  // First column takes up as much space as possible, second column takes up as little space as necessary
					gap={1}  // This is the gap between columns
					p={4}
					alignItems='center'
				>
					{/* IMPT: field key must be the same as value */}
          <EditableField 
						label="Serial Number"
            fieldKey="serialNumber"
            value={asset.serialNumber}
					/>
					<EditableField 
						label="Model"
            fieldKey="subTypeName"
            value={asset.subTypeName}
					/>
					<EditableField 
						label="Asset Type"
            fieldKey="typeName"
            value={asset.typeName}
					/>
					<EditableField 
						label="Vendor"
            fieldKey="vendor"
            value={asset.vendorName}
					/>
          <EditableField
            label="Value"
            fieldKey="value"
            value={asset.value}
          />
          <EditableField
            label="Location"
            fieldKey="location"
            value={asset.location}
          />
        </Grid>
      </Box>

      <Flex mb={4} gap={4}>
        <Grid 
          templateColumns="20% 80%"
          templateRows="repeat(3, 1fr)"
          gap={4}
          width="100%"
        >
            <Heading as="h2" size="sm" mb="2">
              {asset.shared ? 'Current Users: ' : 'Current User: '}
            </Heading>
            <Box>
            {currentUsers?.map(user => (
              <>
                <ItemLink key={user.userId} isCopy={false} item={user} />
                <ActionButton key={formTypes.RETURN} formType={formTypes.RETURN} item={asset} />
              </>
            ))}
            </Box>

            <Heading as="h2" size="sm" mb="2">Past Users:</Heading>
            <Flex gap={1}>
              {pastUsers?.map((user, index) => (
                <ItemLink key={index} isCopy={false} item={user} />
              ))}
            </Flex>

            <Heading as="h2" size="sm" mb="2">Reserved for:</Heading>
            <Box>
            {reservedUsers?.map(user => (
              <ItemLink key={user.userId} isCopy={false} item={user} />
            ))}
            </Box>
        </Grid>
      </Flex>

      <Box>
        <IconButton
          icon={<FiInfo />}
          isRound
          aria-label="Bookmark"
          mb={4}
        />
        {status !== AssetStatus.DELETED && status !== AssetStatus.LOANED && ( // change to deldate?
          <Flex gridGap="2">
            <Button onClick={() => setFormType(formTypes.DEL_ASSET)} colorPalette="red">
              CONDEMN
            </Button>
            <Button onClick={() => setFormType(formTypes.LOAN)} data-asset-id={asset.assetId} colorPalette="green">
              LOAN
            </Button>
          </Flex>
        )}
      </Box>

			{asset.history && 
				<Timeline 
					events={asset.history}
				/>
			}
		</VStack>
	);
}

export default Asset;
