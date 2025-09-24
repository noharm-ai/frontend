import { isEmpty } from "lodash";

import { store } from "store/index";

export class FeatureService {
  static has = (f: string) => {
    const features = (store.getState().user as any).account.features;

    if (isEmpty(features)) return false;

    return features.indexOf(f) !== -1;
  };

  static hasCPOE = () => {
    const segments = (store.getState().segments as any).list;

    return segments.filter((s: any) => s.cpoe).length > 0;
  };

  static hasMixedCPOE = () => {
    const segments = (store.getState().segments as any).list;

    return (
      segments.filter((s: any) => s.cpoe).length !==
      segments.filter((s: any) => !s.cpoe).length
    );
  };
}
