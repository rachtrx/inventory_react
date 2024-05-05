import React from 'react';

const IconNav = ({name}) => (
  <svg className="user-nav__icon" fill="currentColor" viewBox="0 0 20 20">
    <use href={`./logo.svg#${name}`}></use>
  </svg>
);

export default IconNav;