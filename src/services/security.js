import Role from "models/Role";
import { store } from "store/index";

const security = () => {
  const hasCpoe = () => {
    console.log("HASCPOE DEPRECATED");
    //TODO: switch to feature
    const account = store.getState().user.account;

    if (account.isCpoe) {
      return true;
    }

    return account.roles.indexOf(Role.CPOE) !== -1;
  };

  return {
    hasCpoe,
  };
};

export default security;
