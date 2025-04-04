import { Box, Heading, Text, Button, Flex, IconButton, SimpleGrid, Grid, VStack, HStack } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, FormType, useFormModal } from '../../context/ModalProvider';
import TextEditableField from '../utils/TextEditableField';
import { ResponsiveText } from '../utils/ResponsiveText';
import { UserLink } from '../buttons/ItemLink';
import { AssetStatus } from './utils/AssetStatus';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import AssetTimeline from '../timeline/assets/AssetTimeline';
import Tags from '../tags/Tags';
import { ReturnButton } from '../buttons/actions/ReturnButton';
import { ItemStarButton, StarButton } from '../buttons/StarButton';
import SelectEditableField from '../utils/SelectEditableField';
import assetService from '../../services/AssetService';

const Asset = ({ asset }) => {
  const { editKey, editedValue, handleEdit, handleSave } = useDrawer()
  const { setFormType } = useFormModal()

  const handleBookmarkUpdate = (isBookmarked) => {
    console.log(isBookmarked)
    handleSave('bookmarked', !isBookmarked);
  }

  const pastUsers = asset.pastUsers;

  const status = asset?.delEventId !== undefined ? AssetStatus.DELETED :
  asset?.loanEventId !== undefined ? AssetStatus.LOANED :
  asset?.reserveEventId !== undefined ? AssetStatus.RESERVED :
  AssetStatus.AVAILABLE;

  // console.log(status);

  const loan = asset.loanEventId ? asset.history.find(event => event.eventId === asset.loanEventId)?.loan : null
  const reservation = asset.reserveEventId ? asset.history.find(event => event.eventId === asset.reserveEventId)?.reservation : null

	return (
		<VStack align="stretch" p={4} spacing={2}>
      <Box mb={4}>
        <Heading as="h1" size="lg" mb={4}>{asset.serialNumber}</Heading>
				<Heading as="h2" size="md" mb="2">Status: {status}</Heading>	

        <Grid
					templateColumns="auto 1fr auto"  // First column takes up as much space as possible, second column takes up as little space as necessary
					gap={1}  // This is the spacing between columns
					p={4}
					alignItems='center'
				>
					{/* IMPT: field key must be the same as value */}
          <TextEditableField 
						label="Serial Number"
            name="serialNumber"
            value={asset.serialNumber}
					/>
          <TextEditableField 
						label="Alias"
            name="alias"
            value={asset.alias}
					/>
					<TextEditableField 
						label="Model"
            name="subTypeName"
            value={asset.subTypeName}
					/>
					<SelectEditableField 
						label="Asset Type"
            name="typeName"
            value={asset.typeName}
            optionsFn={assetService.getFilters}
            createFn={async (value) => await assetService.createNewType(value)}
					/>
					<TextEditableField 
						label="Vendor"
            name="vendor"
            value={asset.vendorName}
					/>
          <TextEditableField
            label="Value"
            name="value"
            value={asset.value}
          />
          <TextEditableField
            label="Location"
            name="location"
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
            <Heading as="h2" size="sm" mb="2">Current User</Heading>
            <Box>
            {loan && (
              <>
                <UserLink key={loan.user.userId} user={loan.user} isCopy={false} />
                <ReturnButton
                  loanId={loan.loanId}
                />
              </>
            )}
            </Box>

            <Heading as="h2" size="sm" mb="2">Past Users:</Heading>
            <Flex gap={1}>
              {pastUsers?.map((user, index) => (
                <UserLink key={user.userId} isCopy={false} user={user} />
              ))}
            </Flex>

            <Heading as="h2" size="sm" mb="2">Reserved for:</Heading>
            <Box>
              {reservation && (
                <UserLink key={reservation.user.userId} isCopy={false} user={reservation.user} />
              )}
            </Box>

            <Heading as="h2" size="sm" mb="2">Tags</Heading>
            <Tags tags={asset.tags}/>
        </Grid>
      </Flex>

      <Box>
        <StarButton
          id={asset.assetId}
          isBookmarked={asset.bookmarked}
          handleUpdate={() => handleBookmarkUpdate(asset.bookmarked)}
        />
        {status !== AssetStatus.DELETED && status !== AssetStatus.LOANED && ( // change to deldate?
          <Flex gridGap="2">
            <AssetActionButton
              formType={FormType.DEL_ASSET}
              asset={asset}
            />
            <AssetActionButton
              formType={FormType.LOAN}
              asset={asset}
            />
          </Flex>
        )}
      </Box>

			{asset.history && asset.history.length > 0 &&
				<AssetTimeline 
					events={asset.history}
				/>
			}
		</VStack>
	);
}

export default Asset;
