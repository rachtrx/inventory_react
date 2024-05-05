import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from "react-redux";
// import { store } from "./store";
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from "react-router-dom";
import { App } from './App';
import { ChakraProvider } from '@chakra-ui/react';
import { LoadingProvider } from './context/LoadingProvider';
import { AuthProvider } from './context/AuthProvider';
import LoadingSpinner from './components/LoadingSpinner';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ChakraProvider>
    <LoadingProvider>
      <LoadingSpinner/>
      <RouterProvider router={App}/>
    </LoadingProvider>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
