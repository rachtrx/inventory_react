import { Box, Heading, Flex, Grid, VStack } from '@chakra-ui/react';
import { useDrawer } from '../../context/DrawerProvider';
import { FormType } from '../../context/ModalProvider';
import TextEditableField from '../utils/editing/TextEditableField';
import { UserLink } from '../buttons/ItemLink';
import { AssetStatus } from './utils/AssetStatus';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import AssetTimeline from '../timeline/assets/AssetTimeline';
import { AssetTags } from '../tags/Tags';
import { ReturnButton } from '../buttons/actions/ReturnButton';
import { StarButton } from '../buttons/StarButton';
import SelectEditableField from '../utils/editing/SelectEditableField';
import assetService from '../../services/AssetService';
import { useEffect, useState } from 'react';
import { useUI } from '../../context/UIProvider';
import { EditToggleButton } from '../buttons/EditToggleButton';

const Asset = ({ asset }) => {
  const { updateItem } = useDrawer();
  const [ subTypeOptions, setSubTypeOptions ] = useState([]);
  const { handleError } = useUI()

  useEffect(() => {
    const fetchSubTypeOptions = async () => {
      try {
        const response = await assetService.getSubTypeFilters([asset.typeId])

        setSubTypeOptions(response?.data?.[asset.typeId]?.map(option => ({
          ...option,
          id: option.subTypeId
        })) || [])
      } catch(err) {
        handleError(err)
      }
    }
    fetchSubTypeOptions()
  }, [])

  const handleBookmarkUpdate = async (isBookmarked) => {
    await updateItem({ name: 'bookmarked', itemId: asset.assetId, newValue: !isBookmarked });
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
        <Flex gap={2} justifyContent="space-between">
          <Flex gap={1}>
            <StarButton
              id={asset.assetId}
              isBookmarked={asset.bookmarked}
              handleUpdate={() => handleBookmarkUpdate(asset.bookmarked)}
            />
            <EditToggleButton/>
          </Flex>
          <TextEditableField
						name="serialNumber"
						value={asset.serialNumber}
						isHeading={true}
						textProps={{as:"h1", size:"lg", mb: "4"}}
					/>
        </Flex>
				<Heading as="h2" size="md" mb="2">Status: {status}</Heading>	

        <Grid
					templateColumns="auto 1fr auto"  // First column takes up as much space as possible, second column takes up as little space as necessary
					gap={1}  // This is the spacing between columns
					p={4}
					alignItems='center'
				>
					{/* IMPT: field key must be the same as value */}
          {/* <TextEditableField 
						label="Serial Number"
            name="serialNumber"
            value={asset.serialNumber}
					/> */}
          <TextEditableField 
						label="Asset Tag"
            name="alias"
            value={asset.alias}
					/>
					<SelectEditableField 
						label="Model"
            name="subTypeName"
            id={asset.subTypeId}
            value={asset.subTypeName}
            createFn={async (value) => await assetService.createNewSubType(value, asset.typeId)}
            customOptions={subTypeOptions}
					/>
					<SelectEditableField 
						label="Asset Type"
            name="typeName"
            id={asset.typeId}
            value={asset.typeName}
            createFn={async (value) => await assetService.createNewType(value)}
            getUpdateOptions={(newValue) => ([
              { value: "update-delete", label: `This action RENAMES ALL records of ${asset.typeName} to ${newValue}, DELETING ${asset.typeName}` },
              { value: "update-keep", label: `This action TRANSFERS ALL records of ${asset.typeName} to ${newValue}, KEEPING ${asset.typeName}` },
            ])}
					/>
					<SelectEditableField 
						label="Vendor"
            name="vendor"
            id={asset.vendorId}
            value={asset.vendorName}
            createFn={async (value) => await assetService.createNewVendor(value)}
					/>
          <TextEditableField
            label="Value"
            name="value"
            value={asset.value}
            isFloat={true}
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
          alignItems="center"
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
                <Flex gap={1}>
                  <UserLink key={user.userId} isCopy={false} user={user} withTooltip={true}/>
                  {status === AssetStatus.AVAILABLE && <AssetActionButton
                    asset={asset}
                    formType={FormType.RELOAN}
                    user={user}
                  />}
                </Flex>
              ))}
            </Flex>

            <Heading as="h2" size="sm" mb="2">Reserved for:</Heading>
            <Box>
              {reservation && (
                <UserLink key={reservation.user.userId} isCopy={false} user={reservation.user} withTooltip={true}/>
              )}
            </Box>

            <Heading as="h2" size="sm" mb="2">Tags</Heading>
            <AssetTags asset={asset} tags={asset.tags}/>
        </Grid>
      </Flex>

      {status !== AssetStatus.DELETED && status !== AssetStatus.LOANED && ( // change to deldate?
        <Flex gridGap="2" mb={4}>
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

			{asset.history && asset.history.length > 0 &&
				<AssetTimeline 
					events={asset.history}
				/>
			}
		</VStack>
	);
}

export default Asset;
