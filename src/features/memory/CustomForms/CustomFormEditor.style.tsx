import styled from "styled-components";

export const GroupContainer = styled.div`
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

export const QuestionCard = styled.div`
  flex: 0 0 calc(50% - 0.375rem);
  max-width: calc(50% - 0.375rem);
  min-width: 0;
  padding: 0.75rem;
  background: #f0f0f0;
  border-radius: 6px;
`;

export const CarouselWrapper = styled.div`
  position: relative;
  overflow: hidden;
  margin-top: 0.5rem;
`;

export const CarouselTrack = styled.div<{ page: number }>`
  display: flex;
  width: 100%;
  transition: transform 0.25s ease;
  transform: translateX(calc(-${({ page }) => page} * 100%));
  will-change: transform;
`;

export const CarouselSlide = styled.div`
  display: flex;
  gap: 0.75rem;
  min-width: 100%;
  flex-shrink: 0;
  overflow: hidden;
  align-items: flex-start;
`;

export const CarouselNav = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const GroupHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 0.5rem;

  .group-name-field {
    flex: 1;
  }
`;
