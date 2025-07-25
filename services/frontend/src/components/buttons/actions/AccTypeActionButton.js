import { ActionButton, CircleActionButton } from "./ActionButton"

const withAccTypeAction = (ButtonComponent) => ({
	accTypeIds=null,
	grouped=false,
	...rest
}) => {

	return (
		<ButtonComponent
			initialValues={{ 
				accTypeIds: !accTypeIds ? [] : Array.isArray(accTypeIds) ? accTypeIds : [accTypeIds]
			 }}
			{...rest}
		/>
	)
}

export const AccTypeActionButton = withAccTypeAction(ActionButton);
export const CircleAccTypeActionButton = withAccTypeAction(CircleActionButton);