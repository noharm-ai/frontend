import styled from 'styled-components/macro';
import { linearGradient } from 'polished';

import { get } from '@styles/utils';
import { ReactComponent as LogoSVG } from '@assets/noHarm.svg';

const borderSize = '8px';

export const ForgotPass = styled.a`
  color: #6f8bc7;
  font-weight: ${get('weight.light')};
  text-decoration: none;
`;

export const FieldSet = styled.div`
  margin-bottom: 18px;

  &.has-error .ant-input,
  &.has-error .ant-input:hover {
    border-color: #f5222d !important;
  }

  &.has-error .ant-input:focus {
    border-color: #f5222d;
    box-shadow: 0 0 0 2px rgba(245, 34, 45, 0.2);
    outline: 0;
  }

  .ant-checkbox-wrapper {
    color: ${get('colors.commonLighter')};
  }
`;

export const Brand = styled(LogoSVG)`
  display: block;
  margin: 0 auto 62px;
  max-width: 213px;
  width: 100%;
`;

export const Box = styled.div`
  /* background: #ccc; */
  padding-bottom: 1px;
  padding-top: 110px;
`;

export const Wrapper = styled.div`
  background-color: ${get('colors.primary')};
  color: ${get('colors.commonLighter')};
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
    content: '';
    height: ${borderSize};
    left: 0;
    position: absolute;
    width: 100%;
    z-index: 1;

    ${linearGradient({
      colorStops: ['#70bdc4 0%', '#7ebe9a 100%'],
      toDirection: 'to right',
      fallback: '#7ebe9a'
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

  .copyright {
    align-self: flex-end;
    color: #1d2536;
    flex-grow: 1;
    font-family: ${get('fonts.secondary')};
    font-weight: ${get('weight.light')};
    font-size: 12px;
    text-align: center;
    width: 100%;
  }
`;
