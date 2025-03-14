import { Flex } from "@chakra-ui/react";
import { FormType } from "../../context/ModalProvider";
import { AssetActionButton } from "../buttons/actions/AssetActionButton";
import { ReturnButton } from "../buttons/actions/ReturnButton";

export const CardActions = ({ asset, ...buttonProps }) => { // Loan, Return, Reserve, Assign, 

	const actionSet = new Set();

	// console.log(asset);

	if (!asset.deleteEvent?.eventDate) {
		if (asset.reservation) {
			// actionSet.add(FormType.CONFIRM);
			// actionSet.add(FormType.CANCEL);
		} else if (!asset.loan) {
			actionSet.add(FormType.LOAN);
			// actionSet.add(FormType.RESERVE);
			// actionSet.add(FormType.CONDEMN);
		} else {
			actionSet.add(FormType.RETURN);
			// actionSet.add(FormType.RELOAN);
		}
	} 

	return (
		<Flex justifyContent={'stretch'} alignItems="stretch" >
			{Array.from(actionSet).map((action) => {
				return action === FormType.RETURN ? (
					<ReturnButton 
						key={action} 
						loanId={asset.loan.loanId}
					/>
				) : (
					<AssetActionButton 
						key={action}
						formType={action}
						asset={asset}
						{...buttonProps}
					/>
				)
			})}
		</Flex>
	);
};