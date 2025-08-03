import { Flex } from '@chakra-ui/react';
import WarningCard from '../WarningCard';
import { useUI } from '../../../../context/UIProvider';
import { useCallback, useEffect, useState } from 'react';
import { useField } from 'formik';

export const withCreate = (Component) => ({
	name,
	isMulti = false,
	options: availableOptions,
	setOptions: setAvailableOptions,
	onCreate,
	trueKey,
	displayWarning = true,
	...props
}) => {

	// console.log(`${name}, ${JSON.stringify(availableOptions, null, 2)}`);
	if (!Array.isArray(availableOptions)) return <></>;

	const { handleError } = useUI();
	const [ newValues, setNewValues ] = useState([]);
	const [ {value: formikValue}, , { setValue } ] = useField(name);
	const [ options, setOptions ] = useState(availableOptions);

	// useEffect(() => {
	// 	if (name.includes("subTypeName")) {
	// 		console.log(`${name}: ${JSON.stringify(options, null, 2)}`)
	// 		console.log(formikValue);
	// 	};
	// }, [options, name, formikValue])

	// New option clicked sets new option
	const onCreateOption = useCallback((newValue) => {
		const newOption = {value: newValue, label: newValue};
		if (!isMulti) setValue(newValue);
		else setValue([...formikValue, newValue])
		if (!onCreate) {
			setAvailableOptions(newOption)
			return;
		}
		setOptions(prev => [...prev, newOption])
	}, [setOptions, setValue, isMulti, onCreate, formikValue, setAvailableOptions])

	// Update newOptions and newValues when selected option (react-select value) changes 
	useEffect(() => {
		// User changed to no option selected
		if ((isMulti && !formikValue?.length) || (!isMulti && !formikValue)) {
			if (newValues?.length) setNewValues([])
			if (options.some(o => o.__isNew__)) {
				setOptions(prev => prev.filter(o => !o.__isNew__));
			}
		}

		// New Option is selected
		else if (!isMulti && formikValue) {

			const existingOption = options.find(o => o.value === formikValue)

			if (!existingOption) {
				setOptions(prev => [{ value: formikValue, label: formikValue, __isNew__: true }, ...prev])
			}

			if (!existingOption || existingOption.__isNew__) {
				if (!newValues.includes(formikValue)) setNewValues([formikValue])
			} else if (newValues?.length) { // existing option and not new
				setNewValues([])
				return;
			}
		}

		// New option selected
		else if (isMulti && Array.isArray(formikValue) && formikValue.length) {
			const currentOptionValues = new Set(options.map(o => o.value));
			const currentNewValues = new Set(
				options.filter(o => o.__isNew__).map(o => o.value)
			);

			const missingValues = formikValue.filter(v => !currentOptionValues.has(v));
			const stillNew = formikValue.filter(v => currentNewValues.has(v));

			const combinedNewValues = [...missingValues, ...stillNew];

			// Only update if newValues changed
			const newValuesChanged = combinedNewValues.length !== newValues.length ||
				combinedNewValues.some(v => !newValues.includes(v));

			if (newValuesChanged) {
				console.log(combinedNewValues);
				setNewValues(combinedNewValues);
			}

			// Only update if new options are truly new
			if (missingValues.length > 0) {
				const missingOptionObjects = missingValues.map(v => ({
					value: v,
					label: v,
					__isNew__: true,
				}));

				const trulyNewOptions = missingOptionObjects.filter(
					o => !currentOptionValues.has(o.value)
				);

				if (trulyNewOptions.length > 0) {
					console.log(trulyNewOptions);
					setOptions(prev => [...prev, ...trulyNewOptions]);
				}
			}
		}
	}, [newValues, options, isMulti, formikValue, trueKey])

	// Global options update local options
	useEffect(() => {
		if (!options?.length && availableOptions?.length) {
			setOptions(availableOptions);
			return;
		} else {
			const currentNewValues = options.filter(o => o.__isNew__).map(o => o.value);
			const updated = availableOptions.filter(o => currentNewValues.includes(o.value) && !o.__isNew__);

			if (!updated.length) return;

			const found = new Map();

			updated.forEach(o => found.set(o.value, o));
			options.forEach(o => {
				if (!found.has(o.value)) {
					found.set(o.value, o);
				}
			});
			console.log("updating options");
			setOptions(Array.from(found.values()));
		} 
	}, [options, availableOptions])

	// // Indicate new options
	useEffect(() => {
		// console.log("updating options to add __isNew__");
		if (!trueKey) return;

		if (options.some(o => !o[trueKey] && !o.__isNew__)) {
			const newOptions = options
				.map(o => !o[trueKey] && !o.__isNew__ ? {...o, __isNew__: true} : o)
			setOptions(newOptions)
		}
	}, [trueKey, options, setOptions])

	// useEffect(() => {console.log(`${name}, ${JSON.stringify(options, null, 2)}`)}, [name, options])

  	return (
		<Flex direction="column" gap={2} width="100%">
			{Array.isArray(newValues) && onCreate && displayWarning ? newValues.map((newVal) => (
				<WarningCard
					key={newVal}
					message={`Create ${newVal}?`}
					items={availableOptions}
					itemAttr="value"
					onCreate={async () => {
						try {
							const newOption = await onCreate(newVal);
							if (!newOption) {
								throw new Error(`Function did not return the new option for ${newVal}`);
							}
							setAvailableOptions(prev => [newOption, ...prev.filter(o => o.value !== newOption.value)]);
						} catch (err) {
							handleError(err);
						}
					}}
				/>
			)) : undefined}
			<Component
				name={name}
				isMulti={isMulti}
				options={options}
				onCreateOption={onCreateOption}
				{...props}
			/>
		</Flex>
  );
};

