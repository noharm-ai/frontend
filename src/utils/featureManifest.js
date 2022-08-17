import moment from "moment";

import api from "services/api";
import { NEW_FEATURE_ANNOTATION_TYPE } from "utils/memory";

export const annotationManifest = {
  description: "Anotações",
  deployDate: new Date(2021, 1, 28),
  isEnabled(security) {
    if (moment(this.deployDate).isBefore(moment())) {
      return true;
    }

    if (security.isAdmin()) {
      return true;
    }

    return false;
  },
  async shouldShowWelcome(access_token, userId) {
    const maxDate = moment(this.deployDate).add(1, "y");
    const currentDate = moment();

    if (maxDate.isBefore(currentDate)) {
      return false;
    }

    const { data } = await api.getMemory(
      access_token,
      `${NEW_FEATURE_ANNOTATION_TYPE}-${userId}`
    );

    if (data.data.length > 0) {
      return false;
    }

    return true;
  },
  gotIt(access_token, userId) {
    api.putMemory(access_token, {
      type: `${NEW_FEATURE_ANNOTATION_TYPE}-${userId}`,
      value: true,
    });
  },
};
