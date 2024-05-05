// store.js

import { configureStore } from '@reduxjs/toolkit';
import { msgReducer } from './redux/reducers/message';
import { authReducer } from './redux/reducers/auth';
import { assetReducer } from './redux/reducers/asset';
import { usersReducer } from './redux/reducers/users';
import { eventReducer } from './redux/reducers/event';
import { paginationReducer } from './redux/reducers/pagination';
import { formReducer } from './redux/reducers/form';
import { assetsReducer } from './redux/reducers/assets';
import { userReducer } from './redux/reducers/user';
import { uiReducer } from './redux/reducers/ui';

// Import other reducers if available

export const store = configureStore({
  reducer: {
    auth: authReducer,
    msg: msgReducer,
    assets: assetsReducer,
    asset: assetReducer,
    users: usersReducer,
    user: userReducer,
    event: eventReducer,
    pagination: paginationReducer,
    form: formReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
  devTools: process.env.NODE_ENV !== 'production', // Automatically enable Redux DevTools in development
});