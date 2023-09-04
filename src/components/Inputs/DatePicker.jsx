import React from "react";
import AntDatePicker from "antd/lib/date-picker";
import locale from "antd/lib/date-picker/locale/pt_BR";

export const DatePicker = (props) => (
  <AntDatePicker locale={locale} {...props} />
);
