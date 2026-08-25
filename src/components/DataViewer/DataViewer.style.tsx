import styled from 'styled-components';
import { PageCard } from 'styles/Utils.style';
import { get } from 'styles/utils';
import Tag from 'components/Tag';

export const Container = styled(PageCard) <{ $height: number }>`
  display: flex;
  flex-direction: column;
  height: ${p => p.$height}px;
  padding: 0;
  margin: 0;
  overflow: hidden;

  .ant-table-wrapper {
    flex: 1;
    overflow: hidden;

    .ant-spin-nested-loading,
    .ant-spin-container {
      height: 100%;
    }
  }

  .ant-table {
    height: 100%;

    .ant-table-container {
      height: 100%;
      display: flex;
      flex-direction: column;

      .ant-table-header {
        flex-shrink: 0;
      }

      .ant-table-body {
        flex: 1;
        overflow: auto !important;

        &::-webkit-scrollbar {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background-color: rgba(0, 0, 0, 0.05);
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 4px;
          background-color: ${get('colors.accentSecondary')};
          border: 2px solid transparent;
          background-clip: content-box;
        }
      }
    }
  }

  .ant-table-thead > tr > th {
    background: rgba(244, 244, 244, 0.95);
    color: ${get('colors.primary')};
    font-weight: 600;
    font-size: 12px;
    padding: 10px 12px;
  }

  .ant-table-tbody > tr > td {
    padding: 8px 12px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.65);
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(244, 244, 244, 0.8) !important;
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background: rgba(244, 244, 244, 0.4);
  }

  .ant-table-column-sorter {
    color: ${get('colors.accent')};
  }

  .ant-table-column-sort {
    background: rgba(126, 190, 154, 0.1);
  }

  .ant-table-row {
    cursor: pointer;
  }

  .ant-table-cell-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-table-resize-handle {
    position: absolute;
    top: 0;
    right: -5px;
    bottom: 0;
    width: 10px;
    cursor: col-resize;
    z-index: 1;

    &:hover {
      background: ${get('colors.accentSecondary')};
      opacity: 0.5;
    }
  }
`;

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(244, 244, 244, 0.6);
  border-bottom: 1px solid ${get('colors.detail')};
  gap: 12px;
  flex-wrap: wrap;
`;

export const ToolbarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${get('colors.primary')};
`;

export const SearchWrapper = styled.div`
  .ant-input-affix-wrapper {
    width: 280px;

    &:hover,
    &:focus,
    &.ant-input-affix-wrapper-focused {
      border-color: ${get('colors.accentSecondary')};
    }

    &.ant-input-affix-wrapper-focused {
      box-shadow: 0 0 0 2px rgba(112, 189, 195, 0.2);
    }
  }
`;

export const NumberCell = styled.span`
  font-family: 'SF Mono', Consolas, 'Liberation Mono', monospace;
  font-size: 13px;
`;

export const ColumnDropdownContent = styled.div`
  padding: 8px;
  min-width: 220px;
  max-height: 320px;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
              0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
`;

export const DropdownHeader = styled.div`
  display: flex;
  gap: 8px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

export const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 13px;

  &:hover {
    background: rgba(244, 244, 244, 0.8);
  }

  .ant-checkbox-wrapper {
    width: 100%;
  }
`;

export const TypeTag = styled(Tag) <{ $type: string }>`
  font-size: 10px;
  padding: 0 6px;
  margin-left: auto;
  line-height: 18px;
`;

export const FieldItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

export const FieldLabel = styled.div`
  font-weight: 600;
  color: ${get('colors.primary')};
  margin-bottom: 6px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FieldValue = styled.div<{ $type?: string }>`
  color: rgba(0, 0, 0, 0.65);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.6;
  background: ${p => p.$type === 'number' ? 'rgba(112, 189, 195, 0.1)' : 'rgba(244, 244, 244, 0.6)'};
  padding: 12px;
  border-radius: 6px;
  max-height: 400px;
  overflow-y: auto;
  font-family: ${p => p.$type === 'number' ? "'SF Mono', Consolas, monospace" : 'inherit'};
`;

export const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${get('colors.text')};
`;
