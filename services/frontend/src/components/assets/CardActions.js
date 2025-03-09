import { Flex } from "@chakra-ui/react";
import { FormType } from "../../context/ModalProvider";
import { AssetActionButton } from "../buttons/actions/AssetActionButton";

export const CardActions = ({ asset, ...buttonProps }) => { // Loan, Return, Reserve, Assign, 

	const actionSet = new Set();

	// console.log(asset);

	if (asset.reservation) {
		// actionSet.add(FormType.CONFIRM);
		// actionSet.add(FormType.CANCEL);
	} else if (!asset.ongoingLoan) {
		actionSet.add(FormType.LOAN);
		// actionSet.add(FormType.RESERVE);
		// actionSet.add(FormType.CONDEMN);
	} else {
		actionSet.add(FormType.RETURN);
		// actionSet.add(FormType.RELOAN);
	}

	return (
		<Flex justifyContent={'stretch'} alignItems="stretch" >
			{Array.from(actionSet).map((action) => (
				<AssetActionButton 
					key={action}
					formType={action}
					asset={asset}
					{...buttonProps}
				/>
			))}
		</Flex>
	);
};