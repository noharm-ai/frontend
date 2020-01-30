import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components/macro';

import defaultTheme from '@styles/theme';
import Reboot from '@components/Reboot';

export default function App({ children }) {
  return (
    <BrowserRouter>
      <ThemeProvider theme={defaultTheme}>
        <>
          <Reboot />
          {children}
        </>
      </ThemeProvider>
    </BrowserRouter>
  );
}
