import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installChunkErrorRecovery } from './lib/chunks';
import './styles/index.css';

installChunkErrorRecovery();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
