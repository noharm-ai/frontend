const appName = "NoHarm.ai";
const version = "v2.01-beta"; // logoff users when version change
const currentYear = new Date().getFullYear();
const copyright = `${appName} ${currentYear} | v${
  process.env.REACT_APP_VERSION || version
}-beta`;

const appInfo = {
  appName,
  version,
  currentYear,
  copyright,
  apiKey: process.env.REACT_APP_API_KEY || null,
};

export default appInfo;
