import React from "react";
import AntDatePicker from "antd/lib/date-picker";
import locale from "dayjs/locale/pt-br";

export const DatePicker = (props) => (
  <AntDatePicker locale={locale} {...props} />
);
