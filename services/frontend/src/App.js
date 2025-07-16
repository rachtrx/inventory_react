import * as React from "react";
import {
  createBrowserRouter,
  Route,
  Navigate,
  createRoutesFromElements,
} from "react-router-dom";

import './index.css';

import Login from "./components/Login";
import { AssetsPage } from "./components/assets/Assets";
import { UsersPage } from "./components/users/Users";
import Stats from "./components/stats/Stats";
import { PrivateLayout } from "./components/PrivateLayout";
import { AuthProvider } from "./context/AuthProvider";
import Register from "./components/Register";
import Profile from "./components/Profile";
import { AccessoriesPage } from "./components/accessories/Accessories";
import { EventsPage } from "./components/events/Events";
import { RemindersPage } from "./components/reminders/Reminders";

export const App = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthProvider />}>
      {/* Redirect "/" to "/login" */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route element={<PrivateLayout />}>
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/history" element={<EventsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/accessories" element={<AccessoriesPage />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>
  )
);
