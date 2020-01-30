import 'antd/lib/grid/style/index.css';
import styled from 'styled-components/macro';
import { Col as AntCol, Row as AntRow } from 'antd/lib/grid';

const Container = styled.div`
  max-width: 1198px;
  margin: 0 auto;
  padding: 0 15px;
  width: 100%;
`;

const Col = styled(AntCol)``;
const Row = styled(AntRow)``;

export { Col, Row, Container };
