import { ActionButton, CircleActionButton } from "./ActionButton"

const withUserAction = (ButtonComponent) => ({
	user=null,
    grouped=false, // TODO might not be needed unlike asset / accessory.
	...rest
}) => {

	const userArray = !user ? [] : Array.isArray(user) ? user : [user]

    return (
        <ButtonComponent
            initialValues={{userNames: userArray.map(usr => usr.userName), grouped}}
            {...rest}
        />
    )
}

export const UserActionButton = withUserAction(ActionButton);
export const CircleUserActionButton = withUserAction(CircleActionButton);