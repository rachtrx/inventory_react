import { createContext, useContext, useEffect, useState } from 'react';
import assetService from '../services/AssetService';
import userService from '../services/UserService';
import { useDisclosure } from '@chakra-ui/react';
import accessoryService from '../services/AccessoryService';
import { useUI } from './UIProvider';
import { useLoading } from './LoadingProvider';
import { useForm } from './FormProvider';

const DrawerContext = createContext();

const initialState = {
  currentItem: null,
  itemsHistory: [],
  error: null,
};

// Provider component
export const DrawerProvider = ({ children }) => {
	console.log("In drawer provider");

	const { showToast, handleError } = useUI();
	const { setLoading } = useLoading();
  	const [state, setState] = useState(initialState);
	const [editKey, setEditKey] = useState(null);  // Track which field is in edit mode
	const { refreshKey, triggerRefresh } = useForm();

  	const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();

	const resetBreadcrumbs = () => {
		setState(prev => ({ 
			...prev, 
			currentItem: null, 
			itemsHistory: [] 
		}));
	};

	const handleAssetClick = async(asset) => {
		setEditKey(null);
		handleItemClick(asset, "assetId", assetService)
	}

	const handleUserClick = async(user) => {
		setEditKey(null);
		handleItemClick(user, "userId", userService)
	}

	const handleAccTypeClick = async(accType) => {
		setEditKey(null);
		handleItemClick(accType, "accessoryTypeId", accessoryService)
	}

	const handleBreadcrumbClick = async(item) => {
		setEditKey(null);
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
				if (service === assetService) newItem.type = "asset";
				else if (service === userService) newItem.type = "user";
				else if (service === accessoryService) newItem.type = "accessory";
				else newItem.type = "unknown";

				setLoading(true);
				setState(prev => ({
					...prev,
					currentItem: newItem,
					itemsHistory: [...prev.itemsHistory, newItem], // Ensure fetched data is pushed into history
				}));
				setLoading(false);
			} catch (error) {
				setLoading(false);
				handleError(error);
				setState(prev => ({ ...prev, error: error, loading: false }));
			}
		}
	};

	const updateItem = async (payload) => {
		setLoading(true);
		try {
			const response = await state.currentItem.service.updateItem(payload)
			showToast(response?.data?.message || 'Details successfully updated', 'success', 500);
			triggerRefresh()
		} catch (err) {
            console.error(err);
            handleError(err);
        } finally {
            setLoading(false);
        }
	};

	useEffect(() => {
		if(!isDrawerOpen) return;

		console.log("Fetching update");

		const updateState = async () => {
			// Update the item in the history
			const updatedHistory = await Promise.all(
				state.itemsHistory.map(async item => {
					const itemData = await item.service.getItem(item.breadcrumbId);
					return { 
						breadcrumbId: item.breadcrumbId, 
						service: item.service,
						type: item.type,
						...itemData.data 
					};
				})
			);

			// Update the state with new currentItem and itemsHistory
			setState(prev => ({
				...prev,
				currentItem: updatedHistory[updatedHistory.length-1],
				itemsHistory: updatedHistory,
				loading: false
			}));

			setEditKey(null);
		};

		updateState();
	}, [refreshKey])

	const handleClose = () => {
		setEditKey(null);
		onDrawerClose();
		resetBreadcrumbs();
	};

  return (
    <DrawerContext.Provider value={{ 
		...state, 
		setState, 
		editKey, 
		setEditKey,
		handleBreadcrumbClick,
		handleAssetClick,
		handleUserClick,
		handleAccTypeClick, 
		updateItem, 
		handleClose, 
		isDrawerOpen 
	}}>
		{ children }
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);


