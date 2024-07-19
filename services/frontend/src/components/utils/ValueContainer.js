import React from 'react';
import ReactDOM from 'react-dom';
import Select, { components } from 'react-select';

// Styling for the group labels
const groupStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const groupBadgeStyles = {
  backgroundColor: "#EBECF0",
  borderRadius: "2em",
  color: "#172B4D",
  display: "inline-block",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: "1",
  minWidth: 1,
  textAlign: "center"
};

// Function to format the group labels
const formatGroupLabel = data => (
  <div style={groupStyles}>
    <span>{data.label}</span>
    <span style={groupBadgeStyles}>{data.options.length}</span>
  </div>
);

// Custom MultiValueContainer
const MultiValueContainer = ({ children, data, selectProps }) => {
  const index = selectProps.value.findIndex(selected => selected.label === data.label);
  const isLastSelected = index === selectProps.value.length - 1;
  const labelSuffix = isLastSelected ? '' : ", ";
  return `${data.label}${labelSuffix}`;
};

// Main component
export const ComboBox = ({ options }) => {
  const customStyles = {
    valueContainer: (provided, state) => ({
      ...provided,
      textOverflow: "ellipsis",
      maxWidth: "90%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      display: "initial"
    })
  };

  return (
    <Select
      options={options}
      isMulti
      components={{ MultiValueContainer }}
      formatGroupLabel={formatGroupLabel}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      styles={customStyles}
      isSearchable={false}
    />
  );
};