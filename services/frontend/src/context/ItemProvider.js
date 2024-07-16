import { createContext, useContext, useState } from 'react';
import assetService from '../services/AssetService';
import userService from '../services/UserService';

const DrawerContext = createContext();

const initialState = {
  currentItem: null,
  itemsHistory: [],
  loading: false,
  error: null,
};

// Provider component
export const ItemProvider = ({ children }) => {
  const [state, setState] = useState(initialState);


	const resetBreadcrumbs = () => {
		setState(prev => ({ ...prev, currentItem: null, itemsHistory: [] }));
	};

  const handleItemClick = async (item) => {
		// Check if the item is already in the history and set as the current item
		const itemInHistory = state.itemsHistory.find(historyItem => historyItem.id === item.id);
		if (itemInHistory && state.currentItem && state.currentItem.id === item.id) {
			// The item is already the current item, perform some refresh logic?
			return;
		} else if (itemInHistory) {
			// Set from history without fetching
			setState(prev => ({
				...prev,
				currentItem: item,
				itemsHistory: prev.itemsHistory.slice(0, prev.itemsHistory.findIndex(h => h.id === item.id) + 1)
			}));
		} else {
			// Item not in history, fetch new data
			setState(prev => ({ ...prev, loading: true }));
			try {
				const response = await (item.userName ? userService.loadUser(item.id) : assetService.loadAsset(item.id));
				setState(prev => ({
					...prev,
					currentItem: response,
					itemsHistory: [...prev.itemsHistory, response], // Ensure fetched data is pushed into history
					loading: false
				}));
			} catch (error) {
				setState(prev => ({ ...prev, error: error, loading: false }));
			}
		}
	};

  return (
    <DrawerContext.Provider value={{ ...state, handleItemClick, resetBreadcrumbs }}>
      { children }
    </DrawerContext.Provider>
  );
}

export const useDrawer = () => useContext(DrawerContext);


