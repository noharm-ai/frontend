import styled from "styled-components/macro";
import Descriptions from "antd/lib/descriptions";

export default styled(Descriptions)`
  &.ant-descriptions-bordered {
    .ant-descriptions-view {
      table {
        border-collapse: collapse;
      }
    }
  }
`;
