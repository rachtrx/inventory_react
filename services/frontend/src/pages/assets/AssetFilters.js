import React from 'react';
import BookmarkFilter from '../components/forms/utils/BookmarkFilter';
import InputFormControl from '../components/forms/utils/InputFormControl';
import SelectFormControl from '../components/forms/utils/SelectFormControl';
import { Form, Formik } from 'formik';
import { AssetBookmarksToggle } from '../components/forms/utils/ExcelToggle';
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
import { AssetContext } from '../../context/AssetProvider'; 
import { useContext } from 'react';

export default function AssetFilters() { // TODO can have external filters from Dashboard

	const { filters, setFilters, setPagination } = useContext(AssetContext)

	const handleSetFilters = (newFilters) => {
		setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
		setPagination({ page: 1, pageSize: 10, totalItems: 0 })
	}

	const onSubmit = (values, actions) => {
		handleSetFilters(values);
		actions.setSubmitting(false);
	};

	const initialValues = {
    "asset-type": '',
    "model-name": '',
    "vendor": '',
    "status": '',
    "location": '',
    "device-age": '',
    "serial-number": '',
    "asset-tag": ''
  };

  return (
    <Formik initialValues={initialValues} onSubmit={onSubmit}>
			<Form>
				<Grid templateColumns="repeat(3, 1fr)" gap={6}>
					<SelectFormControl
						name="asset-type"
						label="Asset Type"
						placeholder="All"
						options={filters?.device_types?.map(type => ({ label: type, value: type })) ?? []}
					/>
					<InputFormControl
						name="model-name"
						label="Model Name"
						placeholder="All"
					/>
					<SelectFormControl
						name="vendor"
						label="Vendor"
						placeholder="All"
						options={filters?.vendors?.map(vendor => ({ label: vendor, value: vendor })) ?? []}
					/>
					<SelectFormControl
						name="status"
						label="Status"
						placeholder="All"
						options={[
						{ label: "Available", value: "available" },
						{ label: "On Loan", value: "loaned" }
						]}
					/>
					<SelectFormControl
						name="location"
						label="Location"
						placeholder="All"
						options={filters?.locations?.map(location => ({ label: location, value: location })) ?? []}
					/>
					<SelectFormControl
						name="device-age"
						label="Asset Age"
						placeholder="All"
						options={filters?.ages?.map(age => ({ label: age, value: age })) ?? []}
					/>
					<InputFormControl
						name="serial-number"
						label="Serial Number"
						placeholder="All"
					/>
					<InputFormControl
						name="asset-tag"
						label="Asset Tag"
						placeholder="All"
					/>
					<AssetBookmarksToggle/>

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
