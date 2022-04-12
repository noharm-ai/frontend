import styled from 'styled-components/macro';

export const Box = styled.div`
  align-items: ${props => (props.alignItems ? props.alignItems : 'flex-start')};
  display: flex;
  flex-direction: ${props => (props.flexDirection ? props.flexDirection : 'column')};
`;

export const SearchBox = styled.div`
  position: relative;
  background: #eff1f4;
  margin-bottom: 20px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all 0.5s ease;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    .filters {
      pointer-events: all;
      opacity: 1;
      transform: translateY(0);
    }
  }

  .filters {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: #eff1f4;
    border-radius: 4px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    padding: 6px 10px;
    z-index: 1;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-15px);
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .ant-btn-link {
    color: #2e3c5a;
  }

  .ant-btn-link:hover {
    color: #2e3c5a;
    span {
      text-decoration: underline;
    }
  }

  .ant-btn-link:focus {
    color: #2e3c5a;
  }

  .search-box-buttons {
    float: right;
    margin-bottom: 15px;

    button:nth-child(1) {
      margin-right: 5px;
    }
  }

  label {
    font-weight: 400;
  }

  .ant-badge-count {
    top: -10px;
    right: -2px;
    background: #70bdc3;
  }
`;

export const HelpText = styled.div`
  font-size: 12px;
  margin-top: 5px;
`;
