import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CmsProvider } from './cms/CmsProvider';
import './styles/global.css';
import './styles/showcase.css';
import './styles/pages.css';
import './styles/seekout.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(
  <StrictMode>
    <CmsProvider>
      <App />
    </CmsProvider>
  </StrictMode>,
);
