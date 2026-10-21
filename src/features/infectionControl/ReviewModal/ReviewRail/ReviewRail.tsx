import { useTranslation } from "react-i18next";
import { CheckOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import styled from "styled-components";

import { get } from "styles/utils";

export interface IReviewRailItem {
  key: string | number;
  title: string;
  // the day of treatment, like D3/14
  day?: string | null;
  status: { label: string; color: string };
  // filled and valid, and not the one open
  done: boolean;
}

interface ReviewRailProps {
  drugs: IReviewRailItem[];
  // the step open: a drug, the patient after the last one, then the note
  step: number;
  // what is chosen for the clinical note
  noteStatus: { label: string; color?: string };
  onSelect: (step: number) => void;
}

const Rail = styled.nav`
  background: #fcfcfc;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 14px;

  @media (max-width: 768px) {
    border-bottom: 1px solid #f0f0f0;
    border-right: 0;
  }

  .rail-section {
    color: #898685;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.8px;
    padding: 0 10px 4px;
    text-transform: uppercase;
  }

  .rail-divider {
    background: #f0f0f0;
    height: 1px;
    margin: 10px;
  }

  .rail-item {
    align-items: flex-start;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    font: inherit;
    gap: 12px;
    padding: 10px;
    text-align: left;
    width: 100%;

    &:hover {
      background: #f5fafa;
    }

    &.active {
      background: #f0f8f9;
      border-color: #cfe8ea;

      .rail-title {
        font-weight: 600;
      }

      .rail-number {
        background: ${get("colors.accentSecondary")};
        border-color: ${get("colors.accentSecondary")};
        color: #fff;
      }
    }

    &.done .rail-number {
      background: #eaf6f7;
      border-color: ${get("colors.accentSecondary")};
      color: ${get("colors.accentSecondary")};
    }
  }

  .rail-number {
    align-items: center;
    background: #f5f5f5;
    border: 1px solid #f0f0f0;
    border-radius: 999px;
    color: #898685;
    display: flex;
    flex: none;
    font-size: 12px;
    font-weight: 600;
    height: 24px;
    justify-content: center;
    width: 24px;
  }

  .rail-text {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .rail-title {
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    color: ${get("colors.primary")};
    display: -webkit-box;
    font-size: 13px;
    line-height: 1.35;
    overflow: hidden;
  }

  .rail-meta {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .ant-tag {
      margin: 0;
    }
  }

  .rail-day {
    color: #898685;
    font-size: 12px;
    font-weight: 500;
  }
`;

/**
 * The steps of the review: each running antimicrobial with what is chosen for
 * it, then the patient and the clinical note. Any of them can be opened.
 */
export function ReviewRail({
  drugs,
  step,
  noteStatus,
  onSelect,
}: ReviewRailProps) {
  const { t } = useTranslation();
  const patientStep = drugs.length;
  const noteStep = patientStep + 1;

  return (
    <Rail
      aria-label={t("infectionControl.review.steps")}
      data-kb="infectionControl.review.rail"
      data-testid="review-rail"
    >
      <div className="rail-section">
        {t("infectionControl.review.antimicrobials", { count: drugs.length })}
      </div>
      {drugs.map((drug, index) => (
        <button
          key={drug.key}
          type="button"
          className={`rail-item ${index === step ? "active" : ""} ${drug.done ? "done" : ""}`}
          aria-current={index === step ? "step" : undefined}
          title={drug.title}
          onClick={() => onSelect(index)}
          data-testid="review-rail-drug"
        >
          <span className="rail-number">
            {drug.done ? <CheckOutlined /> : index + 1}
          </span>
          <span className="rail-text">
            <span className="rail-title">{drug.title}</span>
            <span className="rail-meta">
              {drug.day && <span className="rail-day">{drug.day}</span>}
              <Tag color={drug.status.color}>{drug.status.label}</Tag>
            </span>
          </span>
        </button>
      ))}

      <div className="rail-divider" />
      <div className="rail-section">
        {t("infectionControl.review.patientStep")}
      </div>
      <button
        type="button"
        className={`rail-item ${step === patientStep ? "active" : ""}`}
        aria-current={step === patientStep ? "step" : undefined}
        onClick={() => onSelect(patientStep)}
        data-testid="review-rail-patient"
      >
        <span className="rail-number">{patientStep + 1}</span>
        <span className="rail-text">
          <span className="rail-title">
            {t("infectionControl.review.patientStepTitle")}
          </span>
          <span className="rail-meta">
            <Tag>{t("infectionControl.review.optionalTag")}</Tag>
          </span>
        </span>
      </button>
      <button
        type="button"
        className={`rail-item ${step === noteStep ? "active" : ""}`}
        aria-current={step === noteStep ? "step" : undefined}
        onClick={() => onSelect(noteStep)}
        data-testid="review-rail-note"
      >
        <span className="rail-number">{noteStep + 1}</span>
        <span className="rail-text">
          <span className="rail-title">
            {t("infectionControl.clinicalNote.stepTitle")}
          </span>
          <span className="rail-meta">
            <Tag color={noteStatus.color}>{noteStatus.label}</Tag>
          </span>
        </span>
      </button>
    </Rail>
  );
}
