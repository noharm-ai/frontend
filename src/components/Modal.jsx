import styled from "styled-components";
import { Modal as AntModal } from "antd";

import { get } from "styles/utils";

const Modal = styled(AntModal)`
  .ant-modal-footer {
    .ant-btn:not([class*="ant-btn "]):hover,
    .ant-btn:not([class*="ant-btn "]):focus {
      border-color: ${get("colors.accent")};
      color: ${get("colors.accent")};
    }

    .ant-btn-primary {
      background-color: ${get("colors.accent")};
      border-color: ${get("colors.accent")};

      &:hover {
        background-color: ${get("colors.accentSecondary")};
        border-color: ${get("colors.accentSecondary")};
      }
    }

    .ant-btn-secondary {
      background-color: ${get("colors.accentSecondary")};
      border-color: ${get("colors.accentSecondary")};
      color: ${get("colors.commonLighter")};

      &:hover {
        background-color: ${get("colors.accent")};
        border-color: ${get("colors.accent")};
        color: ${get("colors.commonLighter")};
      }
    }
  }

  .modal-title {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 18px;
    font-weight: 500;
    color: var(--nh-heading-color);
  }
`;

export default Modal;
