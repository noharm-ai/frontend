import styled, { keyframes } from "styled-components";

// the same tones and sweep as antd's Skeleton
const shimmer = keyframes`
  0% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0 50%;
  }
`;

// a gray block standing in for a piece of text or a control
export const Bone = styled.span<{
  $width?: number | string;
  $height?: number;
  $radius?: number;
}>`
  animation: ${shimmer} 1.4s ease infinite;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.11) 37%,
    rgba(0, 0, 0, 0.06) 63%
  );
  background-size: 400% 100%;
  border-radius: ${({ $radius = 4 }) => $radius}px;
  display: block;
  flex: none;
  height: ${({ $height = 12 }) => $height}px;
  max-width: 100%;
  width: ${({ $width = "100%" }) =>
    typeof $width === "number" ? `${$width}px` : $width};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const card = `
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
`;

// as the patient side of the summary card (InfectionControlPatient)
export const PatientSkeleton = styled.div`
  flex: 1 1 0;
  min-width: 0;
  padding: 14px 20px 16px;

  .skeleton-patient-header {
    align-items: center;
    display: flex;
    gap: 8px;
    height: 32px;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .skeleton-patient-data {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    justify-content: space-between;
  }

  .skeleton-patient-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  @media (max-width: 768px) {
    .skeleton-patient-data {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
`;

// as the antimicrobial timeline (CourseGantt): a label column, then the days
export const TimelineSkeleton = styled.div`
  ${card}

  --label-width: 360px;

  .skeleton-gantt-header {
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    padding: 10px 12px 10px 16px;
  }

  .skeleton-row {
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    height: 64px;

    &:last-child {
      border-bottom: 0;
    }

    &.skeleton-row-header {
      border-bottom-color: #e0e0e0;
      height: 50px;
    }
  }

  .skeleton-label {
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex: 0 0 var(--label-width);
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    padding: 6px 12px;
  }

  .skeleton-label-line {
    align-items: center;
    display: flex;
    gap: 8px;
  }

  /* the day lines of the timeline (Track) */
  .skeleton-track {
    background-image: linear-gradient(to right, #f0f0f0 1px, transparent 1px);
    background-size: 34px 100%;
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    position: relative;
  }

  .skeleton-days {
    display: flex;
    height: 100%;
    padding-top: 18px;
  }

  .skeleton-day {
    align-items: center;
    display: flex;
    flex: 0 0 34px;
    justify-content: center;
  }

  .skeleton-bar {
    margin-top: -7px;
    position: absolute;
    top: 50%;
  }

  @media (max-width: 768px) {
    --label-width: 160px;
  }
`;

// as the courses on phones (CourseList): the title and the switch, then a card
// per course
export const CourseListSkeleton = styled.div`
  .skeleton-list-header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .skeleton-course {
    ${card}

    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 8px;
    padding: 14px 16px;
  }

  .skeleton-label-line {
    align-items: center;
    display: flex;
    gap: 8px;
  }
`;

// as the cultures and the exams cards (InfectionControlCultures,
// InfectionControlExams)
export const PaneSkeleton = styled.div`
  ${card}

  display: flex;
  flex-direction: column;
  height: 100%;

  .skeleton-pane-header {
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    min-height: 47px;
    padding: 12px 16px;
  }

  .skeleton-pane-body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 12px 16px 16px;
  }

  .skeleton-pane-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;
