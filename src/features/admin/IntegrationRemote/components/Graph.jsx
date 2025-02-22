import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";

import { EChartBase } from "components/EChartBase";
import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import NodeModal from "./NodeModal";
import { GraphContainer } from "../IntegrationRemote.style";
import { setSelectedNode } from "../IntegrationRemoteSlice";
import GraphActions from "./GraphActions";
import { formatDateTime } from "utils/date";
import { findProcessGroup } from "../transformer";

export default function Graph() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationRemote.status);
  const template = useSelector(
    (state) => state.admin.integrationRemote.template.data
  );
  const templateDate = useSelector(
    (state) => state.admin.integrationRemote.template.date
  );
  const templateStatus = useSelector(
    (state) => state.admin.integrationRemote.template.status
  );

  const [group, setGroup] = useState(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const currentGroup = group
    ? findProcessGroup(
        template.flowContents.processGroups,
        "instanceIdentifier",
        group
      )
    : null;

  if (!template) {
    return null;
  }

  const nodes = currentGroup
    ? currentGroup.processors
        .concat(currentGroup.processGroups)
        .concat(currentGroup.inputPorts)
        .concat(currentGroup.outputPorts)
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

  const getLinks = () => {
    const allConnections = [
      ...(template?.flowContents.connections ?? []),
      ...(currentGroup?.connections ?? []),
    ];
    const links = [];

    allConnections.forEach((l) => {
      links.push({
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
      });

      // relationship between groups
      links.push({
        source: l.source.groupId,
        target: l.destination.groupId,
        name: l.selectedRelationships.join(","),
        extra: { ...l },
        status: templateStatus[l.instanceIdentifier],
        lineStyle: {
          opacity: 1,
          width: 2,
          curveness: 0,
          color: "#e1bee7",
        },
      });
    });

    return links;
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
        links: getLinks(),
        itemStyle: {
          symbolSize: 50,
          color: (i) => {
            if (i.data.extra.componentType === "PROCESS_GROUP") {
              return "#e1bee7";
            }

            if (
              i.data.extra.type === "OUTPUT_PORT" ||
              i.data.extra.type === "INPUT_PORT"
            ) {
              return "#5c6bc0";
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
    if (currentGroup) {
      let newGroup = null;
      if (currentGroup.groupIdentifier) {
        newGroup = findProcessGroup(
          template.flowContents.processGroups,
          "identifier",
          currentGroup.groupIdentifier
        );
      }

      setInternalLoading(true);
      setTimeout(() => {
        setGroup(newGroup?.instanceIdentifier);
        setInternalLoading(false);
      }, 500);
    } else {
      navigate("/admin/integracao/acesso-remoto");
    }
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
      <div className="template-date">
        <Tooltip title="Última atualização do template">
          <Tag>{formatDateTime(templateDate)}</Tag>
        </Tooltip>
      </div>
      <GraphActions goBack={goBack} />
    </GraphContainer>
  );
}
