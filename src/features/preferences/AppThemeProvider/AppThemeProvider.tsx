import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import LibConfigProvider from "antd/lib/config-provider";
import { ThemeProvider } from "styled-components";
import localePtBr from "antd/locale/pt_BR";
import localeEnUs from "antd/locale/en_US";
import { useTranslation } from "react-i18next";

import defaultTheme from "styles/theme";
import { highContrastTheme, highContrastTokens } from "styles/highContrast";
import { useAppSelector } from "store/index";

interface AppThemeProviderProps {
  children: ReactNode;
}

// antd >= 6.3 darkened this shadow (used by cards/popups); keep the previous
// look
const boxShadowTertiary =
  "0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)";

// The shared wrappers in components/ (Card, Select, Tag, Tooltip...) import the
// CommonJS build (antd/lib), which has its own context and doesn't see the
// ConfigProvider above; it gets only the high contrast tokens, so their
// default look stays as it was.
export function AppThemeProvider({ children }: AppThemeProviderProps) {
  const { i18n } = useTranslation();
  const highContrast = useAppSelector(
    // PreferencesSlice is untyped JS, so its state is not in IRootState
    (state: any) => !!state.preferences.app.highContrast,
  );

  return (
    <ConfigProvider
      locale={i18n.language === "en" ? localeEnUs : localePtBr}
      theme={{
        token: {
          boxShadowTertiary,
          ...(highContrast ? highContrastTokens : {}),
        },
      }}
      modal={{
        mask: {
          blur: false,
        },
      }}
      drawer={{
        mask: {
          blur: false,
        },
      }}
    >
      <LibConfigProvider
        theme={{ token: highContrast ? highContrastTokens : {} }}
      >
        <ThemeProvider theme={highContrast ? highContrastTheme : defaultTheme}>
          {children}
        </ThemeProvider>
      </LibConfigProvider>
    </ConfigProvider>
  );
}
