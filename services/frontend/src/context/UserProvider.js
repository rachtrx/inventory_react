import React, { createContext, useState, useEffect } from 'react';
import { dateTimeObject } from '../config';
import { loadAllUsers } from '../redux/actions/users';

// Create a context for assets
export const UserContext = createContext();

// Devices Provider component
export const AssetProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const createUserObject = function(user) {
    return {
			userId: user.user_id || user.id,
			userName: user.user_name,
			deptName: user.dept_name,
			bookmarked: user.user_bookmarked || user.bookmarked || 0,
			hasResigned: user.has_resigned || 0,
			...(user.asset_tag && user.model_name && user.asset_id && user.device_bookmarked !== undefined && {
					device: {
							assetTag: user.asset_tag,
							modelName: user.model_name,
							assetId: user.asset_id,
							bookmarked: user.device_bookmarked,
					}
			}),
    }
	}

// function takes an array of users and filters them based on whether they already have a device
 const combinedUsers = function(usersArray) {
    return usersArray.reduce((users, user) => {
			// existingUser will return the user if found
			const existingUser = users.find((filteredUser) => filteredUser.userId === user.userId);
			if (existingUser) {
					// User already exists, add the device details to the existing user's users array
					existingUser.devices.push(user.device);
					existingUser.deviceCount = user.device ? existingUser.deviceCount++ : existingUser.deviceCount
			} else {
					// TODO check on the count
					// Create a new user object with the device details
					const newUser = {
					userId: user.userId,
					userName: user.userName,
					deptName: user.deptName,
					bookmarked: user.bookmarked || 0,
					hasResigned: user.hasResigned || 0,
					...(user.device && {devices: [user.device]}),
					deviceCount: user.device ? 1 : 0,
					}
					users.push(newUser);
			}
			return users;
    }, []);
	}

  useEffect(() => {
    fetch('/api/users')
      .then(response => response.json())
      .then(({ results }) => {
				const users = combinedUsers(results.map(user => createUserObject(user)))
				const deviceCounts = [...new Set(users.map((user) => user.deviceCount))].sort((a, b) => a - b);
        setFilters(filters => ({ ...filters, ...deviceCounts }))
      }).catch(err => {
        setError(err);
        setLoading(false);
      })
  })

  useEffect(() => {
    loadAllUsers(filters)
      .then(response => response.json())
      .then(results => {
        const users = combinedUsers(results.map(user => createUserObject(user)))
        setUsers(users);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <UserContext.Provider value={{ users, setUsers, filters, setFilters, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};