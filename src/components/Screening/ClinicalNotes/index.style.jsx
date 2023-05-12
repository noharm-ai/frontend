import styled from "styled-components/macro";

import Menu from "components/Menu";
import ClinicalNotesIndicator from "./ClinicalNotesIndicator";

const createIndicatorClasses = (t) => {
  const classList = ClinicalNotesIndicator.list(t).map(
    (i) => `
    &.annotation-${i.value} {
      border-color: ${i.color};
      background: ${i.backgroundColor};

      &:before {
        content: '${i.label}';
      }
    }
  `
  );

  return classList.join(" ");
};

export const createIndicatorTagClasses = (t) => {
  const translate = t ? t : () => "";
  const classList = ClinicalNotesIndicator.list(translate).map(
    (i) => `
    .${i.key} {
      border-width: 1px;
      border-color: ${i.color};
      background: ${i.backgroundColor};
      color: rgba(0, 0, 0, 0.65);
      font-weight: 500;
      height: 24px;
      min-width: 24px;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
  );

  return classList.join(" ");
};

export const createIndicatorCardClasses = (t) => {
  const translate = t ? t : () => "";
  const classList = ClinicalNotesIndicator.list(translate).map(
    (i) => `
    &.${i.key} {
      border-color: ${i.color};
      background: ${i.backgroundColor};
      color: rgba(0, 0, 0, 0.65);
      font-weight: 500;
    }
  `
  );

  return classList.join(" ");
};

export const MenuPopup = styled(Menu)`
  &.ant-menu-dark {
    background: rgba(46, 60, 90, 0.9);
  }

  &.ant-menu-dark .ant-menu-item,
  &.ant-menu-dark .ant-menu-item-group-title,
  &.ant-menu-dark .ant-menu-item > a {
    color: rgba(255, 255, 255, 0.8);
  }

  .ant-menu-item {
    display: flex;
    align-items: center;

    .avatar {
      width: 20px;
      height: 20px;
      display: inline-block;
      border-radius: 50%;
      margin-right: 10px;
      border: 2px solid #fff;
    }
  }
`;

export const Container = styled.div`
  .paper-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fafafa;
  }

  .list-panel {
    border-left: 1px solid #e0e0e0;
  }
`;

export const PaperContainer = styled.div`
  position: relative;
  padding: 5px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  max-width: 640px;
  width: 100%;
  margin-bottom: 15px;
  transition: all 0.3s linear;

  @media only screen and (min-width: 1400px) {
    max-width: 720px;
  }

  &.edit {
    box-shadow: 0 0 10px rgb(24 144 255 / 30%);
    border: 1px solid rgb(24 144 255);
  }
`;

export const Paper = styled.div`
  position: relative;
  padding: 25px 25px;
  max-height: 80vh;
  width: 100%;
  font-size: 18px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 148, 153, 0.8) #ffffff;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(143, 148, 153, 0.8);
  }

  &.disabled {
    opacity: 0.5;
    overflow-y: hidden;
  }

  &.annotation-enabled {
    span {
      position: relative;
      display: inline-block;
      cursor: default;

      a {
        position: absolute;
        z-index: 2;
        top: -15px;
        right: -15px;
        width: 20px;
        height: 20px;
        background: rgba(46, 60, 90, 0.9);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 12px;
        cursor: pointer;
        pointer-events: all;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.83, 0, 0.17, 1);
      }

      &:before {
        position: absolute;
        z-index: 2;
        bottom: -30px;
        left: 50%;
        font-size: 12px;
        min-width: 110px;
        width: 100%;
        background: rgba(46, 60, 90, 0.9);
        border-radius: 5px;
        color: #fff;
        transform: translateX(-50%);
        padding: 5px;
        text-align: center;
        opacity: 0;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.83, 0, 0.17, 1);
      }

      &:hover {
        a {
          opacity: 1;
        }

        &:before {
          opacity: 1;
        }
      }

      &.annotation {
        padding: 0 4px;
        border-radius: 5px;
        border-width: 1px;
        border-style: solid;
        margin-bottom: 2px;
        font-weight: 500;
      }

      ${(props) => createIndicatorClasses(props.t)}
    }
  }

  &.annotation-disabled {
    span {
      a {
        display: none;
      }
    }
  }
`;

export const List = styled.div`
  height: 80vh;
  padding: 0 15px 10px 15px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 148, 153, 0.8) #ffffff;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #fff;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(143, 148, 153, 0.8);
  }

  h2 {
    font-size: 18px;
    font-weight: 600;
    position: sticky;
    top: 0;
    left: 0;
    background: #fff;
  }

  h2:first-child {
    margin-top: 8px;
  }

  .line-group {
    .line {
      display: flex;
      padding: 7px 0;
      border-top: 1px solid #e0e0e0;
      cursor: pointer;

      &:hover,
      &.active {
        background: rgba(244, 244, 244, 0.8);
        color: #1890ff;
      }

      .time {
        margin-left: 8px;
        margin-right: 10px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .name {
        font-weight: 700;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-transform: uppercase;

        span {
          display: block;
          font-weight: 300;
          text-transform: none;
        }
      }
    }

    .line:last-child {
      margin-bottom: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
  }

  .indicators {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 75px;
    align-items: center;

    .ant-tag {
      margin-bottom: 2px;
    }

    ${(props) => createIndicatorTagClasses(props.t)}
  }

  .day-info {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    border-top: 1px solid #e0e0e0;
    border-bottom: 1px solid #e0e0e0;
    padding: 5px 0;
    margin-bottom: 10px;

    .indicators {
      min-width: 70px;
    }

    button {
      height: 50px;
    }
  }
`;

export const PaperHeader = styled.div`
  padding: 10px 15px;
  width: 100%;
  max-width: 640px;

  @media only screen and (min-width: 1400px) {
    max-width: 720px;
  }

  .line {
    display: flex;
    justify-content: space-between;
  }

  .info {
    font-size: 18px;

    .name {
      font-weight: 600;
    }
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  padding: 10px;
  background: #fafafa;
  margin-bottom: 5px;

  > div {
    width: 40%;

    @media only screen and (min-width: 1400px) {
      width: 45%;
    }
  }

  label {
    display: block;
    font-weight: 700;
  }

  .btn-search {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: 20%;

    @media only screen and (min-width: 1400px) {
      width: 10%;
    }
  }

  .ant-select-selection__choice {
    height: 27px !important;
  }
`;

export const Legend = styled.div`
  font-size: 13px;

  a {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const WelcomeBubble = styled.div`
  width: 400px;

  .action {
    margin-top: 15px;
  }
`;
