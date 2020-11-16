import React from 'react';

import Tabs from '@components/Tabs';

import Signature from '@containers/UserConfig/Signature';

export default function UserConfig() {
  return (
    <Tabs
      defaultActiveKey="1"
      style={{ width: '100%', marginTop: '20px' }}
      type="card gtm-tab-userconfig"
    >
      <Tabs.TabPane tab="Textos padrão" key="1">
        <Signature />
      </Tabs.TabPane>
    </Tabs>
  );
}
