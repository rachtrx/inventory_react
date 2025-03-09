import { createContext, useContext, useState } from 'react';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import { Drawer, useDisclosure } from '@chakra-ui/react';
import ItemDrawer from '../components/ItemDrawer';
import accessoryService from '../services/AccessoryService';
import { getDisplayValue } from '../config';
import { useUI } from './UIProvider';
import { useLoading } from './LoadingProvider';

const DrawerContext = createContext();

const initialState = {
  currentItem: null,
  itemsHistory: [],
  loading: false,
  error: null,
};

const types = {
	ASSET: "ASSET",
	USER: "USER",
	ACCESSORY: "ACCESSORY",
	NONE: "NONE"
}

// Provider component
export const DrawerProvider = ({ children }) => {
	console.log("In drawer provider");

	const { handleDevError, handleError } = useUI();
	const { setLoading } = useLoading();
  	const [state, setState] = useState(initialState);
	const [editKey, setEditKey] = useState(null);  // Track which field is in edit mode
	const [editedValue, setEditedValue] = useState(null);

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

	const resetBreadcrumbs = () => {
		setState(prev => ({ 
			...prev, 
			currentItem: null, 
			currentItemType: types.NONE,
			itemsHistory: [] 
		}));
	};

	const handleAssetClick = async(asset) => {
		handleItemClick(asset, "assetId", assetService)
	}

	const handleUserClick = async(user) => {
		handleItemClick(user, "userId", userService)
	}

	const handleAccTypeClick = async(accType) => {
		handleItemClick(accType, "accessoryTypeId", accessoryService)
	}

	const handleBreadcrumbClick = async(item) => {
		handleItemClick(item);
	}

  	const handleItemClick = async (item, key=null, service=null) => {
		console.log(`Item clicked, ${item}`);

		// Check if the item is already in the history and set as the current item
		if (!isDrawerOpen) onDrawerOpen();

		let itemIndexInHistory;

		if (!key && !service) {
			itemIndexInHistory = state.itemsHistory.findIndex(historyItem => item.breadcrumbId && historyItem.breadcrumbId === item.breadcrumbId); // IMPT is it ok for same reference?
			if (itemIndexInHistory === -1) throw new Error("Unable to load item from history!")
		} else {
			itemIndexInHistory = state.itemsHistory.findIndex(historyItem => item[key] && historyItem[key] === item[key]);
		}

		if (itemIndexInHistory !== -1 && state.itemsHistory.length-1 === itemIndexInHistory) {
			console.log("Item is the current item!");
			// The item is already the current item, perform some refresh logic?
			return;
		} else if (itemIndexInHistory !== -1) {
			console.log("Item is already in history!");
			// Set from history without fetching

			setState(prev => ({
				...prev,
				currentItem: prev.itemsHistory[itemIndexInHistory],
				itemsHistory: prev.itemsHistory.slice(0, itemIndexInHistory + 1)
			}));
		} else {
			// Item not in history, fetch new data
			if (!key || !service) throw new Error("Error loading item: Identifier or Service not found.")

			setState(prev => ({ ...prev, loading: true }));
			try {
				const id = item[key];

				setLoading(true);

				const response = await service.getItem(id);

				const newItem = response.data;
				console.log(newItem);

				newItem.breadcrumbId = id;
				newItem.service = service;

				setLoading(true);
				setState(prev => ({
					...prev,
					currentItem: newItem,
					itemsHistory: [...prev.itemsHistory, newItem], // Ensure fetched data is pushed into history
					loading: false
				}));
				setLoading(false);
			} catch (error) {
				setLoading(false);
				handleError(error);
				setState(prev => ({ ...prev, error: error, loading: false }));
			}
		}
	};

	const updateState = (updatedCurrentItem) => {
		// Update the item in the history
		const updatedHistory = state.itemsHistory.map(item =>
			item.id === state.currentItem.id ? updatedCurrentItem : item
		);

		// Update the state with new currentItem and itemsHistory
		setState(prev => ({
				...prev,
				currentItem: updatedCurrentItem,
				itemsHistory: updatedHistory,
				loading: false
		}));

		console.log(`Saving remarks for key ${editKey}: ${editedValue}`);
		setEditKey(null);
		setEditedValue(null); // Clear edited remarks
	}

	const handleAddRemark = (id, remark, dateTime) => {
		const eventIndex = state.currentItem.events.findIndex(event => event.id === id);
		if (eventIndex === -1) {
			console.error('Event not found');
			return; // Optionally handle error more gracefully
		}
		
		const updatedEvent = { ...state.currentItem.events[eventIndex] };

		// Append the new remark to the remarks array of the cloned event
		updatedEvent.remarks = [...updatedEvent.remarks, {
			text: remark,
			authorisedUserId: 'Admin', // TODO
			remarkedAt: dateTime
		}];

		// Clone the events array and replace the updated event
		const updatedEvents = [...state.currentItem.events];
		updatedEvents[eventIndex] = updatedEvent;

		// Set the updated events array back to the state
		const updatedCurrentItem = { ...state.currentItem, events: updatedEvents };
		updateState(updatedCurrentItem);
	}

	const handleSave = () => {
		handleDevError();
		// Update the currentItem's events
		// const updatedCurrentItem = { ...state.currentItem, [editKey]: editedValue };
		// updateState(updatedCurrentItem)
	};

	const handleEdit = (key, value) => {
		console.log(`setting key as ${key} and value as ${value}`);
		handleDevError();
    	// setEditKey(key);  // Set current edit mode to the field name
		// setEditedValue(value);
  	};

	const handleChange = (e) => {
		handleDevError();
		// setEditedValue(e.target.value);
	};

	const handleClose = () => {
		onDrawerClose();
		resetBreadcrumbs();
	};

  return (
    <DrawerContext.Provider value={{ 
		...state, 
		setState, 
		editKey, 
		editedValue,
		handleBreadcrumbClick,
		handleAssetClick,
		handleUserClick,
		handleAccTypeClick, 
		handleSave, 
		handleAddRemark, 
		handleEdit, 
		handleChange, 
		handleClose, 
		isDrawerOpen 
	}}>
		{ children }
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);


