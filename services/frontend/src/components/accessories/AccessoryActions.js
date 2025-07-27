import React from 'react';
import { FormType } from '../../context/FormProvider';
import { AccTypeActionButton, CircleAccTypeActionButton } from '../buttons/actions/AccTypeActionButton';
import { CircleReturnButton } from '../buttons/actions/ReturnButton';

export default function AccessoryActions() {

  return (
    <>
      <CircleReturnButton/>
      {[FormType.LOAN, FormType.UPDATE_ACC].map((formType) => {
        return (
          <CircleAccTypeActionButton
            key={formType}
            formType={formType}
          />
        );
      })}
    </>
  );
};
