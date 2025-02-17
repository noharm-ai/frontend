import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Select, Button, Divider, Flex, Space } from "antd";

export const SelectCustom = ({ children, onChange, ...props }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(null);

  const onSelectAll = () => {
    const options = React.Children.map(children, (child) => {
      if (searchValue) {
        if (
          `${child.props.children}`
            .toLowerCase()
            .includes(`${searchValue}`.toLowerCase())
        ) {
          return child.props.value;
        }

        return null;
      }

      return child.props.value;
    });

    if (onChange) {
      onChange(options);
      setSearchValue(null);
    }
  };

  return (
    <Select
      onSearch={(v) => setSearchValue(v)}
      onChange={onChange}
      dropdownRender={(menu) => (
        <>
          {menu}
          {props.mode === "multiple" && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Divider style={{ margin: "10px 0" }} />
              <Flex justify="flex-end">
                <Space>
                  <Button
                    type="text"
                    onClick={() => onChange([])}
                    disabled={props.value?.length === 0}
                  >
                    Limpar
                  </Button>
                  <Button type="text" onClick={() => onSelectAll()}>
                    {t("labels.selectAll")}
                  </Button>
                </Space>
              </Flex>
            </div>
          )}
        </>
      )}
      {...props}
    >
      {children}
    </Select>
  );
};
