import React from 'react';
import 'antd/lib/date-picker/style/index.css';
import AntDatePicker from 'antd/lib/date-picker';
import localePtBr from 'antd/lib/date-picker/locale/pt_BR';
import localeEnUs from 'antd/lib/date-picker/locale/en_US';

export const RangeDatePicker = props => (
  <AntDatePicker.RangePicker
    locale={props.language === 'en' ? localeEnUs : localePtBr}
    {...props}
  />
);
