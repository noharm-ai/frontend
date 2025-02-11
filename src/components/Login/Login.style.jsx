import styled from "styled-components";

import { get } from "styles/utils";
import { NoHarmLogo as LogoSVG } from "assets/NoHarmLogo";
import { NoHarmLogoEn as LogoENSVG } from "assets/NoHarmLogoEn";

export const FieldError = styled.span`
  display: block;
  margin-top: 5px;
`;

export const Brand = styled(LogoSVG)`
  display: block;
  margin: 0 auto 62px;
  width: 15em;
  // filter: hue-rotate(150deg); // outubro rosa

  @media (min-width: ${get("breakpoints.md")}) {
    width: 20em;
  }

  .cls-1 {
    fill: #22395b;
  }
`;

export const BrandEN = styled(LogoENSVG)`
  display: block;
  margin: 0 auto 62px;
  width: 15em;
  // filter: hue-rotate(150deg); // outubro rosa

  @media (min-width: ${get("breakpoints.md")}) {
    width: 20em;
  }

  .cls-1 {
    fill: #22395b;
  }
`;

export const LoginContainer = styled.div`
  position: relative;
  display: flex;
  height: 100vh;
  width: 100%;
  font-size: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  @media (min-width: ${get("breakpoints.xxl")}) {
    font-size: 16px;
  }

  > div {
    width: 100%;
  }

  .form {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (min-width: ${get("breakpoints.lg")}) {
      padding: 0 5em;
      width: 45%;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 700px;
      min-width: 300px;
      width: 85%;

      .checkbox {
        display: flex;
        justify-content: flex-start;
        width: 100%;
      }

      .input {
        margin-bottom: 1em;
        font-size: 1.4em;
      }

      .input-password {
        font-size: 1.4em;
        margin-top: 1em;
      }

      button {
        margin-top: 1em;
        font-size: 1.4em;
        height: 50px;

        &.small {
          font-size: 1em;
        }

        &.ant-btn-primary {
          background-color: #32d1e8;
          border-color: #32d1e8;

          &:hover {
            background-color: #00bcd7;
            border-color: #00bcd7;
          }
        }
      }
    }

    .ant-checkbox-wrapper {
      span {
        font-size: 16px;
      }
    }

    .company-name {
      font-size: 1.4em;
      text-align: center;
      margin-bottom: 20px;
    }

    .description {
      font-size: 1em;
    }
  }

  .bg {
    display: none;
    position: relative;
    background-image: url("/imgs/pharma.png");
    background-repeat: no-repeat;
    background-size: contain;
    background-position: bottom center;

    @media (min-width: ${get("breakpoints.lg")}) {
      display: block;
      width: 52%;
    }

    .gradient {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 5em;
      background: linear-gradient(
        360deg,
        rgba(255, 255, 255, 1) 34%,
        rgba(255, 255, 255, 0) 100%
      );
    }
  }

  .copyright {
    position: absolute;
    bottom: 0;
    font-size: 12px;
    text-align: center;
    width: 100%;
  }
`;
