import { Flex } from "@chakra-ui/react";
import { formTypes } from "../../context/ModalProvider";
import ActionButton from "../buttons/ActionButton";

export const CardActions = ({ asset, ...buttonProps }) => { // Loan, Return, Reserve, Assign, 

	const actionSet = new Set();

	if (!asset.users || asset.users.length === 0) {
		actionSet.add(formTypes.LOAN);
	} else {
		asset.users.forEach((user) => {
			if (user.loanEventId) {
				actionSet.add(formTypes.RETURN);
			}

			if (user.reserveEventId) {
				actionSet.add(formTypes.LOAN); // LOAN TO RESERVED
			}

			if (asset.shared || (!user.reserveEventId && !user.loanEventId)) {
				actionSet.add(formTypes.LOAN); // NEW LOAN
			}

			// if (user.reserveEventId) {
			// 	actionSet.add(formTypes.CANCEL); // CANCEL
			// }

			// if (!user.reserveEventId && !user.loanEventId) { // Perhaps leave out condemn
			// 	actionSet.add(formTypes.CONDEMN);
			// }
		});
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