import React from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Heading,
  Grid,
  GridItem
} from '@chakra-ui/react';

const AssetFilters = ({ filters }) => {
  return (
    <Formik>
      <Form>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <FormControl id="device-type" mb={4}>
            <FormLabel>Device Type</FormLabel>
            <Select placeholder="All">
              {filters?.device_types?.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="model-name" mb={4}>
            <FormLabel>Model Name</FormLabel>
            <Input type="text" placeholder="All" />
            {/* Implement dropdown suggestions if needed */}
          </FormControl>

          <FormControl id="vendor" mb={4}>
            <FormLabel>Vendor</FormLabel>
            <Select placeholder="All" required>
              {filters?.vendors?.map((vendor, index) => (
                <option key={index} value={vendor}>{vendor}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="status" mb={4}>
            <FormLabel>Status</FormLabel>
            <Select placeholder="All" required>
              <option value="available">Available</option>
              <option value="loaned">On Loan</option>
            </Select>
          </FormControl>

          <FormControl id="location" mb={4}>
            <FormLabel>Location</FormLabel>
            <Select placeholder="All" required>
              {filters?.locations?.map((location, index) => (
                <option key={index} value={location}>{location}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="device-age" mb={4}>
            <FormLabel>Device Age</FormLabel>
            <Select placeholder="All" required>
              {filters?.ages?.map((age, index) => (
                <option key={index} value={age}>{age}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl id="serial-number" mb={4}>
            <FormLabel>Serial Number / Asset Tag</FormLabel>
            <Input type="text" placeholder="All" />
          </FormControl>

          <GridItem colSpan={1} justifySelf="center" alignSelf="center">
            <Button colorScheme="blue" type="submit">Search</Button>
          </GridItem>

          <GridItem colSpan={1} justifySelf="center" alignSelf="center">
            <Button colorScheme="gray" variant="outline" type="reset">Reset</Button>
          </GridItem>
        </Grid>
      </Form>
    </Formik>
  );
};

export default AssetFilters;
