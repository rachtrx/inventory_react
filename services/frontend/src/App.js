import * as React from "react";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  // Navigate,
  Routes
} from "react-router-dom";

import './index.css';

import Login from "./components/Login";
import { AssetsPage } from "./components/assets/Assets";
import { UsersPage } from "./components/users/Users";
import Dashboard from "./components/home/Dashboard";
import { PrivateLayout } from "./components/PrivateLayout";
import { AuthProvider } from "./context/AuthProvider";
import Register from "./components/Register";

export const App = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AuthProvider/>}>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      <Route element={<PrivateLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/assets" element={<AssetsPage />}/>
        <Route path="/users" element={<UsersPage />}/>
        {/* <Route path="/history" element={<Users />}/> */}
      </Route>
        
      </Route>
  )
);