import { ActionButton } from "./ActionButton"

export const AccTypeActionButton = ({
	accType=null,
	grouped=false,
	...rest
}) => {
	const accTypeArray = !accType ? [] : Array.isArray(accType) ? accType : [accType]

	return (
		<ActionButton
			initialValues={{accNames: accTypeArray.map(accType => accType.accessoryName) ,grouped}}
			{...rest}
		/>
	)
}