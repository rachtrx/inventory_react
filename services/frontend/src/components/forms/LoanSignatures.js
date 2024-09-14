import { Box, Flex } from "@chakra-ui/react";
import { ResponsiveText } from "../utils/ResponsiveText";
import { FormikSignatureField } from "./utils/SignatureField";
import { FieldArray } from "formik";

export const LoanSignatures = ({userLoans}) => {

	return (
		<Box position='relative'>
			<FieldArray name={`loans.signatures`}>
				{loanHelpers => loan.assets.map((asset, assetIndex, array) => ())}
				<Flex>
					{assetLoans.map(assetLoan =>
						<ResponsiveText>{assetLoan.assetTag} {assetLoan.peripherals.join(', ')} {assetLoan.expectedReturnDate}</ResponsiveText>
					)}
					
					<FormikSignatureField
						name={`loans.signatures.${assetLoans.userId}`}
						label={`Signature`}
					/>
					{assetHelpers => loan.assets.map((asset, assetIndex, array) => (
						<Flex direction="column" key={asset.key}>
							<LoanAsset
								fieldArrayName={`loans.${loanIndex}.assets`}
								assetIndex={assetIndex}
								asset={asset}
								assetHelpers={assetHelpers}
							/>
							<Flex justifyContent="flex-start" mt={2} mb={4}>
								{assetIndex === array.length - 1 && (
									<AddButton
										handleClick={() => assetHelpers.push(createNewAsset())}
										label={'Add Asset'}
									/>
								)}
							</Flex>
						</Flex>
					))}
					
				</Flex>
			</FieldArray>
		</Box>
	);
}