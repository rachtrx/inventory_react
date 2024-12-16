import { Box, Button, Flex, ListItem } from "@chakra-ui/react";
import { ModalBody, ModalFooter } from "@chakra-ui/modal";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FormikSignatureField } from "../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useAddAssets } from "./AddAssetsProvider";

export const AddAssetStep2 = () => {

  const { formData, handleSubmit, prevStep } = useAddAssets();

	return (
		<Formik
			initialValues={formData}
			onSubmit={handleSubmit}
			validateOnChange={true}
			enableReinitialize={true}
			// validateOnBlur={true}
		>
			<Form>
				<ModalBody>
				{Object.entries(formData).map(([type, subTypes], idx) => (
					<Flex 
						key={idx}
						direction="column"
						border="1px solid"
						borderColor="gray.300"
						borderRadius="md"
						p={4}
						mb={4}
						boxShadow="sm"
					>
						{/* Display Asset Information */}
						<ResponsiveText size="lg" fontWeight="bold">
						Type: {type}
						</ResponsiveText>

						{/* Display Users Associated with This Asset */}
						{/* {assetReturn.userNames.length > 0 && (
						<Box mt={2}>
							<ResponsiveText fontWeight="bold">Users:</ResponsiveText>
							<UnorderedList>
							{assetReturn.userNames.map((userName, index) => (
								<ListItem key={assetReturn.userIds[index]}>
								{userName}
								</ListItem>
							))}
							</UnorderedList>
						</Box>
						)} */}

						{/* Display Accessories Associated with This Asset */}
						{/* {assetReturn.accessories.length > 0 && (
						<Box mt={2}>
							<ResponsiveText fontWeight="bold">Accessories Returned:</ResponsiveText>
							<UnorderedList>
							{assetReturn.accessories.map(accessory => (
								<ListItem key={accessory.accessoryTypeId}>
								{accessory.accessoryName} - {accessory.count}/{accessory.accessoryLoanIds.length} returned
								</ListItem>
							))}
							</UnorderedList>
						</Box>
						)} */}
					</Flex>
					))}
				</ModalBody>
			
				<ModalFooter>
					<Button onClick={prevStep}>Back</Button>
					<Button colorPalette="blue" type="submit">Submit</Button>
				</ModalFooter>
			</Form>
		</Formik>
	);
}