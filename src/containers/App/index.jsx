import React, { useState } from "react";
import { ThemeProvider } from "styled-components";

import defaultTheme from "styles/theme";
import Reboot from "components/Reboot";
import Alert from "components/Alert";
import { isStorageAvailable } from "utils/storage";

export default function App({ children }) {
  const [storageAvailable] = useState(isStorageAvailable);
  const [alertClosed, setAlertClosed] = useState(false);

  return (
    <ThemeProvider theme={defaultTheme}>
      <>
        <Reboot />
        {!storageAvailable && !alertClosed && (
          <Alert
            banner
            type="warning"
            showIcon
            closable
            onClose={() => setAlertClosed(true)}
            message="Seu navegador está bloqueando o armazenamento local (cookies/local storage)."
            description="Isso impede o funcionamento correto do login e de algumas preferências. Verifique as configurações de privacidade do seu navegador (ex.: desative a navegação privada ou permita cookies para este site)."
          />
        )}
        {children}
      </>
    </ThemeProvider>
  );
}
