import { FormType } from '../../context/FormProvider';
import { CircleUserActionButton } from '../buttons/actions/UserActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';

export default function UserActions() {

  return (
        <>
        <CircleReturnButton/>
        {[
          FormType.LOAN, 
          FormType.ADD_USER, 
          FormType.DEL_USER,
          FormType.TAG_USER,
          FormType.UNTAG_USER,
        ].map((formType) => {
            return (
              <CircleUserActionButton
                key={formType}
                formType={formType}
              />
            );
          })}
        </>
    )
};

