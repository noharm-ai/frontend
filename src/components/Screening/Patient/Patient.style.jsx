import styled from 'styled-components/macro';

import { get } from '@styles/utils';
import Heading from '@components/Heading';

export const Wrapper = styled.div`
  border: 1px solid ${get('colors.detail')};
  overflow: hidden;
`;

export const Name = styled(Heading)`
  padding: 6px 15px;

  @media (max-width: 768px) {
    margin: 0;
  }
`;

export const NameWrapper = styled.div`
  transition: all 0.5s;
  background: ${props => (props.hasIntervention ? '#ffcdd2' : '#fff')};

  .btn-container {
    display: flex;
    justify-content: flex-end;

    > i {
      padding-top: 6px;
      margin-right: 7px;
    }
  }
`;

export const Box = styled.div`
  align-items: center;
  border-top: 1px solid ${get('colors.detail')};
  display: flex;
  min-height: 30px;
  padding: 3.5px 15px;

  strong {
    color: #2e3c5a;
  }

  &.recalc {
    display: flex;
    justify-content: center;
    text-align: center;
  }

  &.see-more {
    display: flex;
    justify-content: center;
    text-align: center;

    button {
      color: #696766;
      height: auto;
      padding-right: 2px;
    }

    button:hover span {
      text-decoration: underline;
    }

    .anticon-info-circle {
      color: #1890ff;
    }

    div.tags {
      display: inline-block;
      vertical-align: middle;
    }
  }

  &.experimental {
    .cell strong {
      color: #1890ff;
    }
  }

  .experimental-text {
    cursor: pointer;
    outline: none;
    color: #1890ff;
    border: 0;
    background: #fff;
  }
`;
