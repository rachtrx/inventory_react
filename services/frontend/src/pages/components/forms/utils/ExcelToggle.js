import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FormLabel, HStack, Switch } from '@chakra-ui/react';
import { toggleExcelUpload, toggleCustomInput, toggleBookmark } from '../../../../redux/actions/forms/helpers';

const withToggle = (Component, toggleAction, stateSelector) => {
    // stateSelector is a function
    return function EnhancedToggle({inputsToReset, setFieldValue, ...props}) {
      const dispatch = useDispatch();
      const toggleState = useSelector(stateSelector);
  
      const handleChange = () => {
        // Reset specified fields when the toggle changes
        console.log("Resetting values in Toggle Function");
        
        if (inputsToReset && setFieldValue) {
            if(toggleState) { // swtiched on, reset initial
                inputsToReset.initial?.forEach(field => {
                    setFieldValue(field, '');
                });
            } else { // not switched on, reset alternates
                inputsToReset.alternate?.forEach(field => {
                    setFieldValue(field, '');
                });
            }
        }

        dispatch(toggleAction); // TODO check if need to call
      };
  
      // Pass the toggle state and handleChange as props to the wrapped component
      return <Component {...props} isChecked={toggleState} onChange={handleChange} />;
    };
};


const Toggle = ({label, isChecked, onChange}) => {
    return (
        <HStack justify="space-between">
            <FormLabel mb="0">{label}</FormLabel>
            <Switch isChecked={isChecked} onChange={onChange} />
        </HStack>
    );
};

// Creating an enhanced toggle with the HOC
export const CustomToggle = withToggle(Toggle, toggleCustomInput, (state) => state.form.isCustomInput);
export const ExcelToggle = withToggle(Toggle, toggleExcelUpload, (state) => state.form.isExcelUpload);
export const AssetBookmarksToggle = withToggle(Toggle, toggleBookmark, (state) => state.assets.isBookmarked);