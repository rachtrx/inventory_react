import * as React from "react";
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
} from "react-router-dom";

import './index.css';

import Login from "./components/Login";
import { AssetsPage } from "./components/assets/Assets";
import { UsersPage } from "./components/users/Users";
import Dashboard from "./components/home/Dashboard";
import { PrivateLayout } from "./components/PrivateLayout";
import { AuthProvider } from "./context/AuthProvider";
import Register from "./components/Register";
import Profile from "./components/Profile";
import { AccessoriesPage } from "./components/accessories/Accessories";
import { EventsPage } from "./components/events/Events";

export const App = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AuthProvider/>}>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      <Route element={<PrivateLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/history" element={<EventsPage />}/>
        <Route path="/assets" element={<AssetsPage />}/>
        <Route path="/users" element={<UsersPage />}/>
        <Route path="/accessories" element={<AccessoriesPage />}/>
        <Route path="/profile" element={<Profile />}/>
      </Route>
        
      </Route>
  )
);