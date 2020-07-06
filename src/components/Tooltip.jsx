import React from 'react';

import 'antd/lib/tooltip/style/index.css';
import AntTooltip from 'antd/lib/tooltip';

const Tooltip = props => (
  <AntTooltip mouseLeaveDelay={0} {...props}>
    {props.children}
  </AntTooltip>
);

export default Tooltip;
