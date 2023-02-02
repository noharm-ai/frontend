const appName = "NoHarm.ai";
const version = "v2.02-beta";
const currentYear = new Date().getFullYear();
const copyright = `${appName} ${currentYear} ${version}`;

const appInfo = {
  appName,
  version,
  currentYear,
  copyright,
  apiKey: process.env.REACT_APP_API_KEY || null,
};

export default appInfo;
