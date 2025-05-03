// src/contexts/DataLoadingContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const DataLoadingContext = createContext();

export const DataLoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({});

  const registerLoader = (key) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: true
    }));
  };

  const completeLoader = (key, result) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: false
    }));
    
    setData(prev => ({
      ...prev,
      [key]: result
    }));
  };

  const setError = (key, error) => {
    setErrors(prev => ({
      ...prev,
      [key]: error
    }));
    
    setLoadingStates(prev => ({
      ...prev,
      [key]: false
    }));
  };

  const isLoading = Object.values(loadingStates).some(state => state === true);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <DataLoadingContext.Provider 
      value={{ 
        isLoading, 
        hasErrors, 
        errors, 
        data, 
        registerLoader, 
        completeLoader, 
        setError 
      }}
    >
      {children}
    </DataLoadingContext.Provider>
  );
};

export const useDataLoading = () => useContext(DataLoadingContext);

// Helper hook for fetching data with the context
export const useApiData = (key, fetchFunction, params = [], dependencies = []) => {
  const { registerLoader, completeLoader, setError, data, isLoading } = useDataLoading();
  
  useEffect(() => {
    const fetchData = async () => {
      registerLoader(key);
      try {
        const result = await fetchFunction(...params);
        completeLoader(key, result);
        return result;
      } catch (error) {
        setError(key, error.message || 'Failed to fetch data');
        throw error;
      }
    };
    
    fetchData();
  }, dependencies);
  
  return { 
    data: data[key], 
    isLoading 
  };
};