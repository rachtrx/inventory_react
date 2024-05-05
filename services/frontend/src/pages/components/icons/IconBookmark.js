import React from 'react';

const IconBookmark = ({ fill = false }) => (
  <svg className="user-nav__icon" fill="currentColor" viewBox="0 0 20 20">
    <use href={'./logo.svg#icon-bookmark' + fill ? '-fill' : ''}></use>
  </svg>
);

export default IconBookmark;