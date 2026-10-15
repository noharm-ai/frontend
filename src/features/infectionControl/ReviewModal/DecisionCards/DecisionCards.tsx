import { CheckOutlined, CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { Radio, Tooltip } from "antd";
import styled from "styled-components";

import { get } from "styles/utils";

import { EvaluationDecision } from "../reviewForm";

export interface IDecisionCard {
  value: EvaluationDecision;
  label: string;
  description: string;
}

interface DecisionCardsProps {
  options: IDecisionCard[];
  value: EvaluationDecision | null;
  onChange: (value: EvaluationDecision) => void;
  "aria-label": string;
}

// the color of each verdict, as its tag shows it
const DECISION_COLORS: Record<
  EvaluationDecision,
  { color: string; background: string }
> = {
  conforming: { color: "#388e3c", background: "#f6ffed" },
  nonConforming: { color: "#cf1322", background: "#fff1f0" },
  skip: { color: "#898685", background: "#fafafa" },
};

const DECISION_ICONS: Record<EvaluationDecision, React.ReactNode> = {
  conforming: <CheckOutlined />,
  nonConforming: <CloseOutlined />,
  skip: <MinusOutlined />,
};

/* compact choices in a row, each telling what it means on hover */
const Cards = styled.div`
  .ant-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  && .ant-radio-wrapper {
    align-items: center;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 999px;
    margin: 0;
    padding: 5px 14px 5px 8px;
    position: relative;

    &:hover {
      border-color: ${get("colors.accentSecondary")};
    }

    &::after {
      display: none;
    }

    /* the radio stays for the keyboard and screen readers, the icon shows it */
    .ant-radio {
      height: 1px;
      left: 0;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      top: 0;
      width: 1px;
    }

    > span:last-child {
      padding: 0;
    }
  }

  ${Object.entries(DECISION_COLORS).map(
    ([decision, { color, background }]) => `
    && .decision-${decision} {
      .decision-icon {
        border-color: ${color};
        color: ${color};
      }

      &.ant-radio-wrapper-checked {
        background: ${background};
        border-color: ${color};
        box-shadow: 0 0 0 1px ${color};

        .decision-label {
          color: ${color};
        }
      }
    }
  `,
  )}

  .decision-card {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  .decision-icon {
    align-items: center;
    border: 1.5px solid;
    border-radius: 999px;
    display: flex;
    flex: none;
    font-size: 9px;
    height: 18px;
    justify-content: center;
    width: 18px;
  }

  .decision-label {
    color: ${get("colors.primary")};
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
  }
`;

/**
 * The verdict on a drug: conforming, not conforming or left out. Each choice
 * tells what it means on hover
 */
export function DecisionCards({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: DecisionCardsProps) {
  return (
    <Cards>
      <Radio.Group
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        options={options.map((option) => ({
          value: option.value,
          className: `decision-${option.value}`,
          label: (
            <Tooltip title={option.description}>
              <span className="decision-card">
                <span className="decision-icon" aria-hidden="true">
                  {DECISION_ICONS[option.value]}
                </span>
                <span className="decision-label">{option.label}</span>
              </span>
            </Tooltip>
          ),
        }))}
      />
    </Cards>
  );
}
