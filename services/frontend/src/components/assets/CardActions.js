import { Flex } from "@chakra-ui/react";
import { formTypes } from "../../context/ModalProvider";
import ActionButton from "../buttons/ActionButton";

export const CardActions = ({ asset, ...buttonProps }) => { // Loan, Return, Reserve, Assign, 

	const actionSet = new Set();

	if (asset.reservation) {
		// actionSet.add(formTypes.CONFIRM);
		// actionSet.add(formTypes.CANCEL);
	} else if (!asset.ongoingLoan) {
		actionSet.add(formTypes.LOAN);
		// actionSet.add(formTypes.RESERVE);
		// actionSet.add(formTypes.CONDEMN);
	} else {
		actionSet.add(formTypes.RETURN);
		// actionSet.add(formTypes.RELOAN);
	}

	return (
		<Flex justifyContent={'stretch'} alignItems="stretch" >
			{Array.from(actionSet).map((action) => (
				<ActionButton 
					key={action} 
					formType={action} 
					item={asset}
					initialValues={{assetTag: asset.assetTag}}
					{...buttonProps}
				/>
			))}
		</Flex>
	);
};