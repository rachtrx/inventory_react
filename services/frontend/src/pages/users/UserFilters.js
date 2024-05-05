import React from 'react';
import BookmarkFilter from '../components/forms/utils/BookmarkFilter';
import InputFormControl from '../components/forms/utils/InputFormControl';
import SelectFormControl from '../components/forms/utils/SelectFormControl';
import { Form, Formik } from 'formik';
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

const UserFilters = ({ filters }) => {
  return (
    <Formik>
      <Form>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <SelectFormControl
              name="department"
              label="Department"
              placeholder="All"
              options={filters?.depts?.map(type => ({ label: type, value: type })) ?? []}
          />

          <SelectFormControl
              name="deviceCounts"
              label="No. of Devices"
              placeholder="All"
              options={filters?.deviceCounts?.map(type => ({ label: type, value: type })) ?? []}
          />

          <InputFormControl
              name="username-name"
              label="Username"
              placeholder="All"
          />

          <BookmarkFilter/>
        </Grid>
      </Form>
    </Formik>

  );
};

export default UserFilters;