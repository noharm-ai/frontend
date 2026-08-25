import styled from "styled-components";

export const Box = styled.div`
  align-items: ${(props) =>
    props.alignItems ? props.alignItems : "flex-start"};
  display: flex;
  flex-direction: ${(props) =>
    props.flexDirection ? props.flexDirection : "column"};
`;

export const SearchBox = styled.div`
  position: relative;
  padding: 6px 10px;
  transition: all 0.5s ease;

  &.open {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    .filters {
      grid-template-rows: 1fr;
      padding: 15px 0;
      margin-top: 20px;
      opacity: 1;
    }
  }

  .filters {
    /* grid-template-rows 0fr -> 1fr animates the expansion to any content
       height, so tall filters are never clipped by a max-height cap */
    display: grid;
    grid-template-rows: 0fr;
    padding: 0;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);

    > .filters-inner {
      overflow: hidden;
      min-height: 0;
    }
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
    margin-bottom: 2px;
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

export const FilterCard = styled.div`
  background: #fff;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  margin-top: 2rem;
  box-shadow: 0 -1px 7px rgb(0 0 0 / 16%);
`;
