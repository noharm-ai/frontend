import styled from "styled-components";

// the screening patient card: name on top, icon tabs over a bordered data grid
export const PatientBox = styled.div`
  .patient-header {
    align-items: flex-start;
    display: flex;
    padding-bottom: 5px;
  }

  .patient-header-name {
    color: #2e3c5a;
    flex: 1;
    font-size: 18px;
    font-weight: 500;
  }

  .ant-tabs-nav {
    margin: 0;
  }

  .ant-tabs-tab {
    background: rgba(255, 255, 255, 0.5);
  }

  .ant-tabs-tab-active {
    background: #fff;
  }

  .ant-tabs-tab .anticon {
    font-size: 18px;
    margin-right: 0;
  }

  .ant-tabs-tab.ant-tabs-tab-active .anticon,
  .ant-tabs-tab:hover .anticon {
    color: #1890ff;
  }

  /* two cells a row, like the screening card; each cell draws its right and
     bottom borders and the ones on the outer edge are clipped under the box
     border */
  .patient-data {
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    border-top-left-radius: 0;
    box-shadow:
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: hidden;
  }

  .patient-data-item {
    border-bottom: 1px solid #e0e0e0;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    margin: 0 -1px -1px 0;
    min-width: 0;
    padding: 5px 10px;
  }

  .patient-data-item-label {
    color: #2e3c5a;
    font-size: 12px;
    font-weight: 300;
  }

  .patient-data-item-value {
    color: #2e3c5a;
    font-size: 12px;
    font-weight: 400;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media only screen and (min-width: 1400px) {
      font-size: 14px;
    }

    .small {
      font-size: 12px;
      font-weight: 300;
      margin-left: 4px;
    }
  }
`;
