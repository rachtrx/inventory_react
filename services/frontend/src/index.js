import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider } from "react-router-dom";
import { App } from './App';
import { defaultSystem, ChakraProvider } from '@chakra-ui/react';
import { UIProvider } from './context/UIProvider';
import { ResponsiveProvider } from './context/ResponsiveProvider';
import LoadingSpinner from './components/LoadingSpinner';
import { Global, css } from '@emotion/react';
import { ThemeProvider } from 'next-themes';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

const GlobalStyles = () => (
  <Global
    styles={css`
          
			.chakra-collapse {
				overflow: visible !important;
			}
      .react-select__value-container {
        display: flex !important;
        flex-wrap: nowrap !important;
        overflow-x: auto !important;
        padding-bottom: 20px;
        -ms-overflow-style: -ms-autohiding-scrollbar !important; /* For Internet Explorer and Edge */
      }

      .react-select__value-container::-webkit-scrollbar {
        height: 8px !important; /* Horizontal scrollbar height */
        width: 12px; /* Vertical scrollbar width, though usually not applicable here */
        background-color: #f4f4f4; /* Light grey background for the scrollbar track */
      }

      .react-select__value-container::-webkit-scrollbar-track {
        background: #f1f1f1 !important; /* Background of the scrollbar track */
      }

      .react-select__value-container::-webkit-scrollbar-thumb {
        background: #888 !important; /* Color of the scrollbar thumb */
        border-radius: 10px !important; /* Rounded corners for the thumb */
      }

      .react-select__value-container::-webkit-scrollbar-thumb:hover {
        background: #555 !important; /* Color when hovering over the scrollbar thumb */
      }
      .react-select__multi-value {
        min-width: auto !important
      }
    `}
  />
);

root.render(
  <>
    <GlobalStyles/>
    <ThemeProvider attribute="class" defaultTheme="system">
      <ChakraProvider value={defaultSystem}>
        <ResponsiveProvider>
          <UIProvider>
            <LoadingSpinner/>
            <RouterProvider router={App}/>
          {/* Insert footer here? */}
          </UIProvider>
        </ResponsiveProvider>
      </ChakraProvider>
    </ThemeProvider>
  </>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
