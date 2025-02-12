import Tag from "antd/lib/tag";

export default Tag;

/* eslint-disable-next-line react-refresh/only-export-components */
export const tagRender = (color) => (props) => {
  const { label, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={color}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
};
