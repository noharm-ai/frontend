import { CheckOutlined, CloseOutlined, MinusOutlined } from "@ant-design/icons";
import { Radio } from "antd";
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

const Cards = styled(Radio.Group)`
  &.ant-radio-group {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  && .ant-radio-wrapper {
    align-items: flex-start;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    margin: 0;
    padding: 12px 14px;
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
    align-items: flex-start;
    display: flex;
    gap: 10px;
  }

  .decision-icon {
    align-items: center;
    border: 1.5px solid;
    border-radius: 999px;
    display: flex;
    flex: none;
    font-size: 10px;
    height: 20px;
    justify-content: center;
    margin-top: 1px;
    width: 20px;
  }

  .decision-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .decision-label {
    color: ${get("colors.primary")};
    font-size: 14px;
    font-weight: 500;
  }

  .decision-description {
    color: #898685;
    font-size: 12px;
  }
`;

/** The verdict on a drug, as cards: conforming, not conforming or left out */
export function DecisionCards({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: DecisionCardsProps) {
  return (
    <Cards
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      options={options.map((option) => ({
        value: option.value,
        className: `decision-${option.value}`,
        label: (
          <span className="decision-card">
            <span className="decision-icon" aria-hidden="true">
              {DECISION_ICONS[option.value]}
            </span>
            <span className="decision-text">
              <span className="decision-label">{option.label}</span>
              <span className="decision-description">{option.description}</span>
            </span>
          </span>
        ),
      }))}
    />
  );
}
