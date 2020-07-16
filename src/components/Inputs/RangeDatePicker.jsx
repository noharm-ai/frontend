import React from 'react';
import 'antd/lib/date-picker/style/index.css';
import AntDatePicker from 'antd/lib/date-picker';
import locale from 'antd/es/date-picker/locale/pt_BR';

export const RangeDatePicker = props => <AntDatePicker.RangePicker locale={locale} {...props} />;
