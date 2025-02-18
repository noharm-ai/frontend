import React from "react";
import { ThemeProvider } from "styled-components";

import defaultTheme from "styles/theme";
import Reboot from "components/Reboot";

export default function App({ children }) {
  return (
    <ThemeProvider theme={defaultTheme}>
      <>
        <Reboot />
        {children}
      </>
    </ThemeProvider>
  );
}
