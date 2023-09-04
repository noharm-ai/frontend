import React from "react";
import AntDatePicker from "antd/lib/date-picker";
import localePtBr from "dayjs/locale/pt-br";
import localeEnUs from "dayjs/locale/en";

export const RangeDatePicker = (props) => (
  <AntDatePicker.RangePicker
    locale={props.language === "en" ? localeEnUs : localePtBr}
    {...props}
  />
);
