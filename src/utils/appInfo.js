const appName = 'NoHarm.ai';
const version = 'v1.54-beta';
const currentYear = new Date().getFullYear();
const copyright = `${appName} ${currentYear} ${version}`;

export default {
  appName,
  version,
  currentYear,
  copyright,
  apiKey: process.env.REACT_APP_API_KEY || null
};
