import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
// import { store } from "./store";
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from "react-router-dom";
import { App } from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { UIProvider } from './context/UIProvider';
import { ResponsiveProvider } from './context/ResponsiveProvider';
import LoadingSpinner from './components/LoadingSpinner';
import { ItemProvider } from './context/ItemProvider';
import { FormProvider } from './context/FormProvider';
import ItemDrawer from './components/ItemDrawer';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChakraProvider>
      <ResponsiveProvider>
        <UIProvider>
          {/* <ItemProvider> */}
            <FormProvider>
              <LoadingSpinner/>
              <RouterProvider router={App}/>
            {/* Insert footer here? */}
            </FormProvider>
          {/* </ItemProvider> */}
        </UIProvider>
      </ResponsiveProvider>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
