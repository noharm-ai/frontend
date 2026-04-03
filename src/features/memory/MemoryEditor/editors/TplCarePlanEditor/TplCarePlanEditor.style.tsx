import styled from "styled-components";

export const EditorCard = styled.div`
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #f0f0f0;
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  .card-title {
    font-weight: 600;
    color: #333;
  }
`;

export const SnippetItemRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

export const CategoryContainer = styled.div`
  padding: 1.25rem;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #f0f0f0;
`;

export const CategoryHeader = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;

  .category-input {
    flex: 1;
  }
`;
