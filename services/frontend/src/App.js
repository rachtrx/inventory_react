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
import AssetsPage from "./pages/assets/Assets";
import UsersPage from "./pages/users/Users";
import CondemnAsset from "./pages/components/forms/main/CondemnAsset";
import Dashboard from "./components/Dashboard";
import { PrivateRoute } from "./components/PrivateRoute";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthProvider";
import Register from "./components/Register";

export const App = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<AuthProvider/>}>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      <Route element={<PrivateRoute/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/assets/page/:pageNumber" element={<AssetsPage />} >
          {/* <Route path="assets/:deviceId" element={<Asset />}/>
          <Route path="onboard" element={<Onboard />}/>
          <Route path="assets/create" element={<CreateAsset />}/>
          <Route path="assets/register" element={<RegisterAsset />}/>
          <Route path="assets/loan" element={<LoanAsset />}/>
          <Route path="assets/return" element={<ReturnAsset />}/>
          <Route path="assets/condemn" element={<CondemnAsset />}/> */}
        </Route>
        <Route path="users" element={<UsersPage />}>
          {/* <Route path="users/:userId" element={<User />}/>
          <Route path="users/create" element={<Onboard />}/>
          <Route path="users/remove" element={<CreateDevice />}/> */}
        </Route>
        {/* <Route path="history" element={<Users />}/> */}
      </Route>
    </Route>
  )
);