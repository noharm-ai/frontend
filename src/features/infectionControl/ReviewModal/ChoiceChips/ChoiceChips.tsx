import { ReactNode } from "react";
import { Radio } from "antd";
import styled from "styled-components";

import { get } from "styles/utils";

export interface IChoiceChip<T> {
  value: T;
  label: ReactNode;
  // the day the choice stands for, next to its label
  date?: string | null;
  disabled?: boolean;
}

interface ChoiceChipsProps<T> {
  options: IChoiceChip<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}

const Chips = styled(Radio.Group)`
  &.ant-radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  && .ant-radio-button-wrapper {
    align-items: center;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    color: ${get("colors.text")};
    display: inline-flex;
    font-size: 13px;
    height: 32px;
    padding: 0 12px;

    &::before {
      display: none;
    }

    &:hover {
      border-color: ${get("colors.accentSecondary")};
    }

    > span:last-child {
      align-items: center;
      display: inline-flex;
      gap: 6px;
    }
  }

  && .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    background: #eaf6f7;
    border-color: ${get("colors.accentSecondary")};
    color: ${get("colors.primary")};
    font-weight: 500;
  }

  && .ant-radio-button-wrapper-disabled {
    background: #f5f5f5;
    color: #bfbfbf;
  }

  .choice-date {
    color: #898685;
    font-weight: 400;
  }
`;

/**
 * Choices laid out side by side, each with the day it stands for: when an
 * evaluation starts, until when it holds, when the next review is
 */
export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: ChoiceChipsProps<T>) {
  return (
    <Chips
      optionType="button"
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      options={options.map((option) => ({
        value: option.value,
        disabled: option.disabled,
        label: (
          <>
            <span className="choice-label">{option.label}</span>
            {option.date && (
              <>
                {" "}
                <span className="choice-date">{option.date}</span>
              </>
            )}
          </>
        ),
      }))}
    />
  );
}
