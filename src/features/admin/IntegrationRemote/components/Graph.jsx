import React, { useState } from "react";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Spin } from "antd";

import { EChartBase } from "components/EChartBase";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import NodeModal from "./NodeModal";

import { GraphContainer } from "../IntegrationRemote.style";

export default function Graph({ template, templateStatus, isLoading }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [group, setGroup] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const currentGroup = group.length ? group[group.length - 1] : null;

  const nodes = currentGroup
    ? currentGroup.processors.concat(currentGroup.processGroups)
    : template?.flowContents.processGroups;

  const getLineColor = (link) => {
    const status = templateStatus[link.instanceIdentifier];

    if (status.queuedCount > 0 && status.queuedCount <= 20) {
      return "#faad14";
    }

    if (status.queuedCount > 20) {
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
      setGroup((oldArray) => [...oldArray.slice(0, -1)]);
      setInternalLoading(false);
    }, 500);
  };

  const onClick = (evt) => {
    if (evt.data.extra.componentType === "PROCESS_GROUP") {
      setInternalLoading(true);
      setTimeout(() => {
        setGroup((oldArray) => [...oldArray, evt.data.extra]);
        setInternalLoading(false);
      }, 500);
    } else {
      setSelectedNode(evt.data);
    }
  };

  return (
    <GraphContainer>
      <Spin spinning={internalLoading}>
        {!internalLoading && (
          <EChartBase
            option={chartOptions}
            style={{ height: "100%" }}
            loading={isLoading || internalLoading}
            onClick={onClick}
          />
        )}
      </Spin>

      <NodeModal data={selectedNode} onCancel={() => setSelectedNode(null)} />
      <div className="action-container">
        <Tooltip title="Voltar ao nível anterior">
          <Button
            shape="circle"
            type="primary"
            icon={<ArrowLeftOutlined />}
            size="large"
            onClick={() => goBack()}
            disabled={group.length === 0}
          ></Button>
        </Tooltip>
      </div>
    </GraphContainer>
  );
}
