import { ActionButton, CircleActionButton } from "./ActionButton"
const withAssetAction = (ButtonComponent) => ({
	asset=null,
	user=null,
	...rest
}) => {

	const assetArray = !asset ? [] : Array.isArray(asset) ? asset : [asset]

	return (
		<ButtonComponent
			initialValues={{assetIds: assetArray.map(ast => ast.assetId), user}}
			{...rest}
		/>
	)
}

export const AssetActionButton = withAssetAction(ActionButton);
export const CircleAssetActionButton = withAssetAction(CircleActionButton);