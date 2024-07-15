import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function useFetchData(action, key) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const data = useSelector(state => state[key]);

  useEffect(() => {
    // Return a cleanup FUNCTION that React will run on unmount
    return () => {
      dispatch({ type: `CLEAR_${key.toUpperCase()}_DATA` });
    };
  }, [dispatch, key]);

  useEffect(() => {
    dispatch(action())
      .then(() => console.log(`Data loaded`))
      .catch(err => {
        console.error(`Error loading data:`, err);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [dispatch, action]);

  return { loading, error, data };
}
