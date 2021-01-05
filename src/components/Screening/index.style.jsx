import styled from 'styled-components/macro';

import Tabs from '@components/Tabs';
import { get } from '@styles/utils';

export const ScreeningTabs = styled(Tabs)`
  .ant-tabs-nav {
    width: 100%;
  }

  .ant-tabs-nav .ant-tabs-tab:nth-last-child(2) {
    margin-left: 100px !important;
  }

  .ant-tabs-bar {
    margin-bottom: 0;
  }

  .ant-tabs-content {
    background: #fff;
    border-radius: 4px;
    box-shadow: 3px 0px 4px rgba(4, 0, 6, 0.15);
    min-height: 100px;
  }
`;

export const BoxWrapper = styled.section`
  background: ${get('colors.commonLighter')};
  border-radius: 4px;
  box-shadow: 3px 0px 4px rgba(4, 0, 6, 0.15);
  padding: 25px;
`;
