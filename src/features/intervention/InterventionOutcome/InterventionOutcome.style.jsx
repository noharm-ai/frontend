import styled from "styled-components/macro";

export const InterventionOutcomeContainer = styled.div`
  padding-top: 10px;

  .collapsible {
    margin-top: 15px;
    max-height: 0;
    overflow: hidden;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
    background: #fafafa;
    padding: 0;
    border-radius: 5px;
    border: 1px solid #d9d9d9;

    .form-label {
      label {
        opacity: 0.75;
      }
    }

    &.visible {
      max-height: 400px;
      opacity: 1;
      padding: 1.5rem;
    }
  }

  .result {
    width: max(400px, 50%);
    margin: 20px auto 35px auto;
    background: #fafafa;
    border-radius: 5px;
    border: 1px solid #d9d9d9;
    padding: 1rem;
  }

  .form-row {
    .main-label {
      font-size: 16px;
    }

    .form-value {
      color: #797979;
      line-height: 1.2;
    }

    .form-input {
      .ant-input.ant-input-disabled {
        color: #00000082;
      }

      .ant-input-number-group-wrapper-disabled,
      .ant-input-number-disabled {
        input {
          color: #00000082;
        }

        &.warning {
          .ant-input-number-group-addon {
            background: #fffbe6;
          }

          .ant-input-number-input-wrap {
            background: #fffbe6;
            border-radius: 5px;
          }
        }

        &.error {
          .ant-input-number-group-addon {
            background: #fff2f0;
          }

          .ant-input-number-input-wrap {
            background: #fff2f0;
            border-radius: 5px;
          }
        }
      }

      .ant-select-disabled {
        .ant-select-selection-item {
          color: #00000082;
        }
      }
    }
  }
`;

export const ConversionDetailsPopover = styled.div`
  min-width: 200px;

  .form-label {
    label {
      color: #2e3c5a;
      font-weight: 600;
    }
  }

  .form-value {
    margin-bottom: 10px;
    color: #797979;
  }

  .component {
    display: flex;
    justify-content: space-between;
    font-size: 12px;

    > div:last-child {
      margin-left: 15px;
    }
  }
`;
