import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useLogStore } from './store/logStore';
import { startMockLogGeneration } from './utils/mockLogGenerator';

// Start mock log generation
startMockLogGeneration(useLogStore.getState());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);