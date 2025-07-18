import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { LoaderProvider } from './context/AuthContext';
import Root from './Root.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'animate.css';
import './theme.css';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoaderProvider>
      <Root />
    </LoaderProvider>
  </StrictMode>
);
