import { Box, Button, Flex, ListItem, ModalBody, ModalFooter, UnorderedList, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../utils/ResponsiveText";
import { FormikSignatureField } from "../utils/SignatureField";
import { FieldArray, Form, Formik } from "formik";
import { useLayoutEffect, useRef, useState } from "react";
import { useReturns } from "./ReturnsProvider";

export const ReturnStep2 = () => {

  const { userReturns, formData, handleSubmit, prevStep } = useReturns()

	console.log(userReturns);

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
				{Object.entries(userReturns).map(([assetTag, assetReturn]) => (
					<Flex 
						key={assetTag}
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
						Asset Tag: {assetTag}
						</ResponsiveText>

						{/* Display Users Associated with This Asset */}
						{assetReturn.users.userNames.length > 0 && (
						<Box mt={2}>
							<ResponsiveText fontWeight="bold">Users:</ResponsiveText>
							<UnorderedList>
							{assetReturn.users.userNames.map((userName, index) => (
								<ListItem key={assetReturn.users.userIds[index]}>
								{userName}
								</ListItem>
							))}
							</UnorderedList>
						</Box>
						)}

						{/* Display Accessories Associated with This Asset */}
						{assetReturn.accessories.length > 0 && (
						<Box mt={2}>
							<ResponsiveText fontWeight="bold">Accessories Returned:</ResponsiveText>
							<UnorderedList>
							{assetReturn.accessories.map(accessory => (
								<ListItem key={accessory.accessoryTypeId}>
								{accessory.accessoryName} - {accessory.count}/{accessory.accessoryIds.length} returned
								</ListItem>
							))}
							</UnorderedList>
						</Box>
						)}
					</Flex>
					))}
				</ModalBody>
			
				<ModalFooter>
					<Button onClick={prevStep}>Back</Button>
					<Button colorScheme="blue" type="submit">Submit</Button>
				</ModalFooter>
			</Form>
		</Formik>
	);
}