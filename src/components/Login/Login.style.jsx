import styled from "styled-components/macro";
import { linearGradient } from "polished";

import { get } from "styles/utils";
import { ReactComponent as LogoSVG } from "assets/noHarm.svg";

const borderSize = "8px";

export const FieldError = styled.span`
  display: block;
  margin-top: 5px;
`;

export const ForgotPass = styled.a`
  color: #6f8bc7;
  font-weight: ${get("weight.light")};
  text-decoration: none;
`;

export const FieldSet = styled.div`
  margin-bottom: 18px;

  .ant-checkbox-wrapper {
    color: ${get("colors.commonLighter")};
  }
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

export const Box = styled.div`
  /* background: #ccc; */
  padding-bottom: 1px;
  padding-top: 110px;
`;

export const Wrapper = styled.div`
  background-color: ${get("colors.primary")};
  color: ${get("colors.commonLighter")};
  display: flex;
  flex-wrap: wrap;
  height: 100vh;
  justify-content: center;
  padding: ${borderSize} 0;
  position: relative;
  width: 100%;

  &:after,
  &:before {
    background: #ddd;
    display: inline-block;
    content: "";
    height: ${borderSize};
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 1;

    ${linearGradient({
      colorStops: ["#70bdc4 0%", "#7ebe9a 100%"],
      toDirection: "to right",
      fallback: "#7ebe9a",
    })}
  }

  &:after {
    top: 0;
  }

  &:before {
    bottom: 0;
  }

  .ant-row,
  .ant-row-flex {
    width: 100%;
  }

  .loader {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .ant-spin-dot-item {
      background-color: #fff;
    }
  }

  .company-name {
    font-size: 18px;
    text-align: center;
    margin-bottom: 20px;
  }

  .description {
    font-weight: 300;
    font-size: 14px;
    margin-top: 5px;
  }

  .copyright {
    align-self: flex-end;
    color: #fff;
    flex-grow: 1;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-weight: ${get("weight.light")};
    font-size: 12px;
    text-align: center;
    width: 100%;
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

    @media (min-width: ${get("breakpoints.md")}) {
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

      button {
        display: block;
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

    @media (min-width: ${get("breakpoints.md")}) {
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
