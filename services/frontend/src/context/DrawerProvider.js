import { createContext, useContext, useState } from 'react';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import { Drawer, useDisclosure } from '@chakra-ui/react';
import ItemDrawer from '../components/ItemDrawer';

const DrawerContext = createContext();

const initialState = {
  currentItem: null,
  itemsHistory: [],
  loading: false,
  error: null,
};

// Provider component
export const DrawerProvider = ({ children }) => {
	console.log("In item provider");

  const [state, setState] = useState(initialState);
	const [editKey, setEditKey] = useState(null);  // Track which field is in edit mode
	const [editedValue, setEditedValue] = useState(null);

  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

	const resetBreadcrumbs = () => {
		setState(prev => ({ ...prev, currentItem: null, itemsHistory: [] }));
	};

  const handleItemClick = async (item) => {
		console.log("Item clicked");
		console.log(item);
		// Check if the item is already in the history and set as the current item
		if (!isDrawerOpen) onDrawerOpen();

		const itemInHistory = state.itemsHistory.find(historyItem => historyItem.id === item.id);
		if (itemInHistory && state.currentItem && state.currentItem.id === item.id) {
			// The item is already the current item, perform some refresh logic?
			return;
		} else if (itemInHistory) {
			console.log("Item is already in history!");
			// Set from history without fetching
			setState(prev => ({
				...prev,
				currentItem: itemInHistory,
				itemsHistory: prev.itemsHistory.slice(0, prev.itemsHistory.findIndex(h => h.id === item.id) + 1)
			}));
		} else {
			// Item not in history, fetch new data
			setState(prev => ({ ...prev, loading: true }));
			try {
				const response = await (item.assetTag ? assetService.loadAsset(item.id) : userService.loadUser(item.id));
				console.log(response.data);
				setState(prev => ({
					...prev,
					currentItem: response.data,
					itemsHistory: [...prev.itemsHistory, response.data], // Ensure fetched data is pushed into history
					loading: false
				}));
			} catch (error) {
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

	const handleSave = () => {
		// Update the currentItem's events
		const updatedCurrentItem = { ...state.currentItem, [editKey]: editedValue };
		updateState(updatedCurrentItem)
	};

	const handleRemarksSave = () => {
		const updatedEvents = state.currentItem.events.map(event =>
			event.id === editKey ? { ...event, remarks: editedValue } : event
		);
		const updatedCurrentItem = { ...state.currentItem, events: updatedEvents };
		updateState(updatedCurrentItem)
	}

	const handleEdit = (key, value) => {
		console.log(`setting key as ${key} and value as ${value}`);
    setEditKey(key);  // Set current edit mode to the field name
		setEditedValue(value)
  };

  const handleChange = (e) => {
    setEditedValue(e.target.value);
  };

	const handleClose = () => {
    onDrawerClose();
    resetBreadcrumbs();
  };

  return (
    <DrawerContext.Provider value={{ ...state, setState, editKey, editedValue, handleItemClick, handleSave, handleRemarksSave, handleEdit, handleChange, handleClose, isDrawerOpen }}>
				{ children }
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);


