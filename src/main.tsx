import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DisplayProvider from './state/DisplayProvider';
import './styles/index.css';
createRoot(document.getElementById('root')!).render(<StrictMode><DisplayProvider><App /></DisplayProvider></StrictMode>);
