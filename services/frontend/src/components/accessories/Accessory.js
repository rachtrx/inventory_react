import { Box, Heading, Flex, Grid, VStack } from '@chakra-ui/react';
import { useDrawer } from '../../context/DrawerProvider';
import { FormType, useFormModal } from '../../context/ModalProvider';
import { ResponsiveText } from '../utils/ResponsiveText';
import { UserLink } from '../buttons/ItemLink';
import AccTimeline from '../timeline/accessories/AccTimeline';
import { CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';

const Accessory = ({ accType }) => {

  const currentUsers = accType.currentUsers;
  const pastUsers = accType.pastUsers;
  const reservedUsers = accType.reservedUsers;

	return (
		<VStack align="stretch" p={4} spacing={2}>
      <Box mb={4}>
        <Flex justifyContent="space-between">
          <Heading as="h1" size="lg" mb={4}>{accType.accessoryName}</Heading>
          <CircleAccTypeActionButton
            formType={FormType.LOAN}
            accTypeIds={accType.accessoryTypeId}
          />
        </Flex>

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

      <Grid
        templateColumns="20% 80%"
        templateRows="repeat(3, 1fr)"
        width="100%"
      >
          <Heading as="h2" size="sm" mb="2">Current Users:</Heading>
          <Flex gap={1}>
            {currentUsers?.map(user => (
              <Box key={user.userId}>
                <UserLink user={user} isCopy={false}/>
              </Box>
            ))}
          </Flex>

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

			{accType.history && accType.history.length > 0 &&
				<AccTimeline
					events={accType.history}
				/>
			}
		</VStack>
	);
}

export default Accessory;
