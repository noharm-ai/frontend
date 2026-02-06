import styled from "styled-components";

export const CustomHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";

  .header-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: #2e3c5a;
      letter-spacing: -0.02em;
    }

    .header-subtitle {
      font-size: 0.875rem;
      color: #696766;
      font-weight: 400;
      opacity: 0.8;
    }
  }

  .brand-container {
    display: flex;
    align-items: center;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.02);
    }

    svg {
      height: 48px;
      width: auto;

      .cls-2 {
        fill: #2e3c5a;
      }
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.25rem;

    .brand-container {
      align-self: flex-end;
    }
  }
`;
