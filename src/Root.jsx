import React, { useContext } from 'react';
import App from './App.jsx';
import { AuthProvider, LoaderContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Loader from './components/Common/Loader';

const Root = () => {
  const { loading } = useContext(LoaderContext);
  return (
    <>
      {loading && <Loader />}
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
};

export default Root; 