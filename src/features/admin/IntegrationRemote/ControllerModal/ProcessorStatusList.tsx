import { List, Avatar } from "antd";

interface IProcessorStatusList {
  controllers: {
    id: string;
    component: {
      name: string;
      state: string;
    };
  }[];
}

export function ProcessorStatusList({ controllers }: IProcessorStatusList) {
  const getColor = (state: string) => {
    switch (state) {
      case "RUNNING":
        return "#b7eb8f";
      case "STOPPED":
        return "#ffccc7";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <List
      itemLayout="horizontal"
      dataSource={controllers}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Avatar
                style={{ backgroundColor: getColor(item.component.state) }}
              />
            }
            title={item.component.name}
            description={item.component.state}
          />
        </List.Item>
      )}
    />
  );
}
