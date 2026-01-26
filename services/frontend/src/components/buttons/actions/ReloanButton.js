import { FormType } from "../../../context/FormProvider"
import { ActionButton, CircleActionButton } from "./ActionButton"

export const withReloanAction = (ButtonComponent) => ({
	loanId,
	...rest
}) => {
	
	const loanIds = !loanId ? [] : Array.isArray(loanId) ? loanId : [loanId]

	return (
		<ButtonComponent
            initialValues={loanIds}
            formType={FormType.RELOAN}
            isMulti={Array.isArray(loanId)}
            {...rest}
		/>
	)
}

export const ReloanButton = withReloanAction(ActionButton);
export const CircleReloannButton = withReloanAction(CircleActionButton);