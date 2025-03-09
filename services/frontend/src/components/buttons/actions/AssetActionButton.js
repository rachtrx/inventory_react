import { ActionButton } from "./ActionButton"

export const AssetActionButton = ({
	asset=null,
	grouped=false,
	...rest
}) => {

	const assetArray = !asset ? [] : Array.isArray(asset) ? asset : [asset]

	return (
		<ActionButton
			initialValues={{serialNumbers: assetArray.map(ast => ast.serialNumber), grouped}}
			{...rest}
		/>
	)
}