import { ActionButton, CircleActionButton } from "./ActionButton"

const withAccTypeAction = (ButtonComponent) => ({
	accType=null,
	grouped=false,
	...rest
}) => {

	const accTypeArray = !accType ? [] : Array.isArray(accType) ? accType : [accType]

	return (
		<ButtonComponent
			initialValues={{serialNumbers: accTypeArray.map(ast => ast.serialNumber), grouped}}
			{...rest}
		/>
	)
}

export const AccTypeActionButton = withAccTypeAction(ActionButton);
export const CircleAccTypeActionButton = withAccTypeAction(CircleActionButton);