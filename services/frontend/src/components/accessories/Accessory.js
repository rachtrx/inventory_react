import { Box, Heading, Text, Button, Flex, IconButton, SimpleGrid, Grid, VStack, HStack } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { useDrawer } from '../../context/DrawerProvider';
import { actionTypes, FormType, useFormModal } from '../../context/ModalProvider';
import TextEditableField from '../utils/TextEditableField';
import { ResponsiveText } from '../utils/ResponsiveText';
import { UserLink } from '../buttons/ItemLink';
import { AssetStatus } from '../assets/utils/AssetStatus';
import { AssetActionButton } from '../buttons/actions/AssetActionButton';
import AssetTimeline from '../timeline/assets/AssetTimeline';
import AccTimeline from '../timeline/accessories/AccTimeline';
import { ReturnButton } from '../buttons/actions/ReturnButton';

const Accessory = ({ accType }) => {
  const { editKey, editedValue, handleEdit } = useDrawer()
  const { setFormType } = useFormModal()

  const currentUsers = accType.currentUsers;
  const pastUsers = accType.pastUsers;
  const reservedUsers = accType.reservedUsers;

  const status =
    accType.currentUsers && accType.currentUsers.length > 0 ? AssetStatus.LOANED : 
    accType.reservedUsers && accType.reservedUsers.length > 0 ? AssetStatus.RESERVED : 
    AssetStatus.AVAILABLE;

	return (
		<VStack align="stretch" p={4} spacing={2}>
      <Box mb={4}>
        <Heading as="h1" size="lg" mb={4}>{accType.accessoryName}</Heading>

        <Grid
					templateColumns="auto 1fr auto" // First column takes up as much space as possible, second column takes up as little space as necessary
					gap={1}  // This is the spacing between columns
					p={4}
					alignItems='center'
				>
					{/* IMPT: field key must be the same as value */}
					<ResponsiveText>Current Stock: {accType.stock}</ResponsiveText>
        </Grid>
      </Box>

      <Flex mb={4} gap={4}>
        <Grid
          templateColumns="20% 80%"
          templateRows="repeat(3, 1fr)"
          gap={4}
          width="100%"
        >
            <Heading as="h2" size="sm" mb="2">Current Users:</Heading>
            <Box>
            {currentUsers?.map(user => (
              <Box key={user.userId}>
                <UserLink user={user} isCopy={false} />
                {/* <ReturnButton
                  
                /> */}
              </Box>
            ))}
            </Box>

            <Heading as="h2" size="sm" mb="2">Past Users:</Heading>
            <Flex gap={1}>
              {pastUsers?.map((user, index) => (
                <UserLink key={user.userId} isCopy={false} user={user} />
              ))}
            </Flex>

            <Heading as="h2" size="sm" mb="2">Reserved for:</Heading>
            <Box>
            {reservedUsers?.map(user => (
              <UserLink key={user.userId} isCopy={false} user={user} />
            ))}
            </Box>
        </Grid>
      </Flex>

      <Box>
        <IconButton
          icon={<InfoOutlineIcon />}
          isRound
          aria-label="Bookmark"
          mb={4}
        />
        {status !== AssetStatus.DELETED && status !== AssetStatus.LOANED && ( // change to deldate?
          <Flex gridGap="2">
            <Button onClick={() => setFormType(FormType.DEL_ASSET)} colorScheme="red">
              CONDEMN
            </Button>
            <Button onClick={() => setFormType(FormType.LOAN)} data-acctype-id={accType.accessoryTypeId} colorScheme="green"> 
              {/* // TODO */}
              LOAN
            </Button>
          </Flex>
        )}
      </Box>

			{accType.history && accType.history.length > 0 &&
				<AccTimeline
					events={accType.history}
				/>
			}
		</VStack>
	);
}

export default Accessory;
