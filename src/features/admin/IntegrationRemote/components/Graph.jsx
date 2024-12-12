import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeftOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Spin, FloatButton } from "antd";

import { EChartBase } from "components/EChartBase";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";
import NodeModal from "./NodeModal";
import { GraphContainer } from "../IntegrationRemote.style";
import { setSelectedNode, setQueueDrawer } from "../IntegrationRemoteSlice";

export default function Graph() {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const template = useSelector(
    (state) => state.admin.integrationRemote.template.data
  );
  const templateStatus = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const [group, setGroup] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const currentGroup = group
    ? template.flowContents.processGroups.find(
        (g) => g.instanceIdentifier === group
      )
    : null;

  if (!template) {
    return null;
  }

  const nodes = currentGroup
    ? currentGroup.processors.concat(currentGroup.processGroups)
    : template?.flowContents.processGroups;

  const getLineColor = (link) => {
    const status = templateStatus[link.instanceIdentifier];

    if (status?.queuedCount > 0 && status?.queuedCount <= 20) {
      return "#faad14";
    }

    if (status?.queuedCount > 20) {
      return "#faad14";
    }

    return "#c4c4c4";
  };

  const chartOptions = {
    title: {
      text: currentGroup ? currentGroup.name : template?.flowContents.name,
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: "quinticInOut",
    series: [
      {
        type: "graph",
        layout: "none",
        roam: true,
        label: {
          show: true,
          position: "bottom",
        },

        labelLayout: {
          hideOverlap: true,
        },
        edgeSymbol: ["circle", "arrow"],
        edgeSymbolSize: [4, 10],

        data: nodes?.map((n) => ({
          id: n.identifier,
          name: n.name,
          x: n.position.x,
          y: n.position.y,
          extra: { ...n },
          status: templateStatus[n.instanceIdentifier],
          symbol: n.componentType === "PROCESS_GROUP" ? "roundRect" : "circle",
          symbolSize: n.componentType === "PROCESS_GROUP" ? 100 : 30,
        })),
        links: currentGroup?.connections.map((l) => ({
          source: l.source.id,
          target: l.destination.id,
          name: l.selectedRelationships.join(","),
          extra: { ...l },
          status: templateStatus[l.instanceIdentifier],
          lineStyle: {
            opacity: 0.9,
            width: 2,
            curveness: 0,
            color: getLineColor(l),
          },
        })),

        itemStyle: {
          symbolSize: 50,
          color: (i) => {
            if (i.data.extra.componentType === "PROCESS_GROUP") {
              return "#e1bee7";
            }

            if (i.data.status?.runStatus === "Running") {
              return "#b7eb8f";
            }

            if (i.data.status?.runStatus === "Stopped") {
              return "#ffccc7";
            }

            return "gray";
          },
        },
      },
    ],
  };

  const goBack = () => {
    setInternalLoading(true);
    setTimeout(() => {
      setGroup(null);
      setInternalLoading(false);
    }, 500);
  };

  const onClick = (evt) => {
    if (evt.data.extra.componentType === "PROCESS_GROUP") {
      setInternalLoading(true);
      setTimeout(() => {
        setGroup(evt.data.extra.instanceIdentifier);
        setInternalLoading(false);
      }, 500);
    } else {
      dispatch(setSelectedNode(evt.data));
    }
  };

  return (
    <GraphContainer>
      <Spin spinning={internalLoading}>
        {!internalLoading && (
          <EChartBase
            option={chartOptions}
            style={{ height: "100%" }}
            loading={status === "loading" || internalLoading}
            onClick={onClick}
          />
        )}
      </Spin>

      <NodeModal />
      <div className="schema">
        <Tag color="#a991d6">{localStorage.getItem("schema")}</Tag>
      </div>
      <FloatButton.Group shape="circle" style={{ right: 24 }}>
        <Tooltip title="Fila de ações">
          <FloatButton
            icon={<UnorderedListOutlined />}
            onClick={() => dispatch(setQueueDrawer(true))}
          />
        </Tooltip>
        <Tooltip title="Voltar ao nível anterior">
          <FloatButton icon={<ArrowLeftOutlined />} onClick={() => goBack()} />
        </Tooltip>
      </FloatButton.Group>
    </GraphContainer>
  );
}
