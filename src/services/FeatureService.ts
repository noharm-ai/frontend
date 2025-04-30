import { isEmpty } from "lodash";

import { store } from "store/index";

export class FeatureService {
  static has = (f: string) => {
    const features = (store.getState().user as any).account.features;

    if (isEmpty(features)) return false;

    return features.indexOf(f) !== -1;
  };
}
