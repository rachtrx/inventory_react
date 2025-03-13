import { ActionButton, CircleActionButton } from "./ActionButton"
const withAssetAction = (ButtonComponent) => ({
	asset=null,
	grouped=false, // ie loan to the same user instead of different users
	...rest
}) => {

	const assetArray = !asset ? [] : Array.isArray(asset) ? asset : [asset]

	return (
		<ButtonComponent
			initialValues={{serialNumbers: assetArray.map(ast => ast.serialNumber), grouped}}
			{...rest}
		/>
	)
}

export const AssetActionButton = withAssetAction(ActionButton);
export const CircleAssetActionButton = withAssetAction(CircleActionButton);