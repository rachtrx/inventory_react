import { FormType } from "../../../context/ModalProvider"
import { ActionButton } from "./ActionButton"

export const ReturnButton = ({loanId, ...rest}) => {

    const loanIds = !loanId ? [] : Array.isArray(loanId) ? loanId : [loanId]

    return (
        <ActionButton
            initialValues={loanIds}
            formType={FormType.RETURN}
            isMulti={Array.isArray(loanId)}
            {...rest}
        />
    )
}