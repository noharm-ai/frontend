import styled from 'styled-components/macro';

export const Container = styled.div`
  padding: 10px;

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
  padding: 5px;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  max-width: 640px;
  width: 100%;
  margin-bottom: 15px;

  @media only screen and (min-width: 1400px) {
    max-width: 720px;
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
`;

export const List = styled.div`
  height: 86vh;
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
      }

      .time {
        margin-left: 8px;
        margin-right: 10px;
      }

      .name {
        font-weight: 700;

        span {
          display: block;
          font-weight: 300;
        }
      }

      .indicators {
        flex: 1;
        text-align: right;
      }
    }

    .line:last-child {
      border-bottom: 1px solid #e0e0e0;
    }
  }
`;

export const PaperHeader = styled.div`
  padding: 5px 15px 10px 15px;
  width: 100%;
  max-width: 640px;

  @media only screen and (min-width: 1400px) {
    max-width: 720px;
  }

  .info {
    font-size: 18px;

    .name {
      font-weight: 600;
    }
  }
`;
