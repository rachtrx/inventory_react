import { ActionButton } from "./ActionButton"

export const UserActionButton = ({
    user=null,
    grouped=false,
    ...rest
}) => {

    const userArray = !user ? [] : Array.isArray(user) ? user : [user]

    return (
        <ActionButton
            initialValues={{userNames: userArray.map(usr => usr.userName), grouped}}
            {...rest}
        />
    )
}