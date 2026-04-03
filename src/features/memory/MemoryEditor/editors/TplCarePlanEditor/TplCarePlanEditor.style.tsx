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

export const FormRow = styled.div`
  margin-bottom: 0.75rem;

  label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }
`;

export const FormError = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 2px;
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
