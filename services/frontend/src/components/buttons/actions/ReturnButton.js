import { FormType } from "../../../context/ModalProvider"
import { ActionButton, CircleActionButton } from "./ActionButton"

export const withReturnAction = (ButtonComponent) => ({
	loanId,
	...rest
}) => {

	const loanIds = !loanId ? [] : Array.isArray(loanId) ? loanId : [loanId]

	return (
		<ButtonComponent
            initialValues={loanIds}
            formType={FormType.RETURN}
            isMulti={Array.isArray(loanId)}
            {...rest}
		/>
	)
}

export const ReturnButton = withReturnAction(ActionButton);
export const CircleReturnButton = withReturnAction(CircleActionButton);