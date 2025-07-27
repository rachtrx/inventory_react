import { Box, Button, Flex, ModalBody, ModalFooter, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useAssetTags } from "../AssetTagsProvider";

export const AddAssetTagsStep2 = () => {

  const { formData, handleAddTagsSubmit, prevStep } = useAssetTags();

	return (
		<Formik
			initialValues={formData}
			onSubmit={handleAddTagsSubmit}
			validateOnChange={true}
			enableReinitialize={true}
			// validateOnBlur={true}
		>
			<Form>
			<ModalBody>
			{formData.tags.map((tag, tagIndex) => (
				<Flex
				key={tagIndex}
				direction="column"
				border="1px solid"
				borderColor="gray.300"
				borderRadius="md"
				p={4}
				mb={4}
				boxShadow="sm"
				>
				<Text fontSize="lg" fontWeight="bold">
					Tag: {tag.tagName}
				</Text>

				{tag.assets.length > 0 && (
					<Box overflowX="auto" w="100%" mt={2}>
					<Table size="sm" variant="striped" minW="500px">
						<Thead>
						<Tr>
							<Th>Serial Number</Th>
							<Th>Remarks</Th>
						</Tr>
						</Thead>
						<Tbody>
						{tag.assets.map((asset, assetIndex) => (
							<Tr key={assetIndex}>
							<Td>{asset.serialNumber}</Td>
							<Td>{asset.remarks || '-'}</Td>
							</Tr>
						))}
						</Tbody>
					</Table>
					</Box>
				)}
				</Flex>
			))}
			</ModalBody>

			<ModalFooter>
				<Button onClick={prevStep}>Back</Button>
				<Button colorScheme="blue" type="submit">
					Submit
				</Button>
			</ModalFooter>
		</Form>
		</Formik>
	);
}