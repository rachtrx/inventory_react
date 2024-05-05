import React from 'react';
import { useFormik } from 'formik';
import Form from './Form';

function CondemnAsset() {

  const validationCheck = function(values) {

  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: values => {
      validationCheck(values)
    },
  });
  
  return (
    <Form formik={formik}>
      {/* group for choosing asset tag that must exist */}
      <div className="form__group--asset-tag form__group--asset-tag--condemned-device">
          <input 
            type="text" 
            className="form__input form__input--asset-tag" 
            name="asset_tag" 
            placeholder="Asset Tag" 
            autocomplete="off" 
            onChange={formik.handleChange}
            value={formik.values.email}
          />
          <div className="form-dropdown form-dropdown--asset-tag hidden-visibility" id="asset_tag_list">
              {/* CANNOT BE ON LOAN */}
              <div className="preview preview--asset-tag"></div>
          </div>
      </div>

      {/* comments */}
      <div className="form__group--remarks-new form__group--remarks-new--condemned-device">
          <input name="remarks" className="form__input form__input--remarks-new" placeholder="Remarks" type="text" autocomplete="off" />
          <label htmlFor="remarks" className="form__label form__label--remarks-new">Remarks</label>
      </div>

      {/* EXCEL */}
      <div className="form__group--excel form__group--excel--condemned-device hidden">
          <button className="btn btn--file-template">Get Template</button>
          <input type="file" id="excel-file" className="file__input hidden" accept=".xlsx, .xls"/>
          <button className="btn btn--file-upload">Upload File</button>
          <div className="form__file-view hidden">
              <span className="form__file--view__file"></span>
              <svg className="btn--remove-file">
                  <use href="#icon-circle-with-cross"></use>
              </svg>
          </div>
      </div>

      {/* USE EXCEL */}
      <div className="form__group--use-excel form__group--use-excel--condemned-device">
          <button className="btn btn--excel" id="condemned-device-excel-btn">Use Excel</button>
      </div>

      {/* USE NORMAL */}
      <div className="form__group--use-normal form__group--use-normal--condemned-device hidden">
          <button className="btn btn--normal" id="condemned-device-normal-btn">Use Normal</button>
      </div>
      {/* <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          onChange={formik.handleChange}
          value={formik.values.email}
        />
        {formik.errors.email ? <div>{formik.errors.email}</div> : null}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          onChange={formik.handleChange}
          value={formik.values.password}
        />
        {formik.errors.password ? <div>{formik.errors.password}</div> : null}
      </div> */}
    </Form>
  );
}

export default CondemnAsset;