import React from 'react';

function Form({formik, children}) {

  return (
    <form onSubmit={formik.handleSubmit}>
      {children};
      <button type="submit">Submit</button>
    </form>
  );
}

export default Form;
