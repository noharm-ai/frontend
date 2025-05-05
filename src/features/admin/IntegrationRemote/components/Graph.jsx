import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import cytoscape from "cytoscape";
import nodeHtmlLabel from "cytoscape-node-html-label";
import contextMenus from "cytoscape-context-menus";

import { NodeModal } from "../NodeModal/NodeModal";
import { GraphContainer } from "../IntegrationRemote.style";
import {
  setSelectedNode,
  pushQueueRequest,
  setQueueDrawer,
} from "../IntegrationRemoteSlice";
import GraphActions from "./GraphActions";
import { findProcessGroup } from "../transformer";
import { GraphHeader } from "./GraphHeader";
import { formatDateTime } from "src/utils/date";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import "./graph.css";

nodeHtmlLabel(cytoscape);
contextMenus(cytoscape);

export default function Graph() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const graphContainer = useRef(null);
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

  useEffect(() => {
    const getLineClass = (link) => {
      const status = templateStatus[link.instanceIdentifier];

      const count = parseInt(status?.queuedCount);

      if (count > 0 && count <= 20) {
        return "filled";
      }

      if (count > 20) {
        return "warning";
      }

      return "default";
    };

    const getLinks = (nodeList) => {
      const allConnections = [
        ...(template?.flowContents.connections ?? []),
        ...(currentGroup?.connections ?? []),
      ];
      const links = [];

      allConnections.forEach((l) => {
        let sourceNode = nodeList.find((n) => n.identifier === l.source.id);
        let targetNode = nodeList.find(
          (n) => n.identifier === l.destination.id
        );

        if (sourceNode && targetNode) {
          links.push({
            data: {
              id: `${l.source.id}-${l.destination.id}`,
              source: l.source.id,
              target: l.destination.id,
              name: l.selectedRelationships.join(","),
              extra: { ...l },
              status: templateStatus[l.instanceIdentifier],
            },
            classes: getLineClass(l),
          });
        } else {
          sourceNode = nodeList.find((n) => n.identifier === l.source.groupId);
          targetNode = nodeList.find(
            (n) => n.identifier === l.destination.groupId
          );

          if (sourceNode && targetNode) {
            //relationship between groups
            links.push({
              data: {
                source: l.source.groupId,
                target: l.destination.groupId,
                name: l.selectedRelationships.join(","),
                extra: { ...l },
                status: templateStatus[l.instanceIdentifier],
              },
            });
          }
        }
      });

      return links;
    };

    const onClick = (data) => {
      if (data.extra.componentType === "PROCESS_GROUP") {
        setInternalLoading(true);
        setTimeout(() => {
          setGroup(data.extra.instanceIdentifier);
          setInternalLoading(false);
        }, 500);
      } else {
        dispatch(setSelectedNode(data));
      }
    };

    if (graphContainer.current) {
      const nodes = currentGroup
        ? currentGroup.processors
            .concat(currentGroup.processGroups)
            .concat(currentGroup.inputPorts)
            .concat(currentGroup.outputPorts)
        : template?.flowContents.processGroups;

      let elements = [];

      nodes?.forEach((n) => {
        const stats = {
          Running: {
            color: "#52c41a",
            label: "Executando",
            count: 0,
          },
          Stopped: {
            color: "#ff4d4f",
            label: "Parado",
            count: 0,
          },
          Invalid: {
            color: "#faad14",
            label: "Inválido",
            count: 0,
          },
          Disabled: {
            color: "gray",
            label: "Desativado",
            count: 0,
          },
        };

        if (n.componentType === "PROCESS_GROUP") {
          Object.values(templateStatus).forEach((item) => {
            if (
              item.groupId === n.instanceIdentifier &&
              item.runStatus &&
              stats[item.runStatus]
            ) {
              stats[item.runStatus].count += 1;
            }
          });
        }

        elements.push({
          data: {
            id: n.identifier,
            name: n.name,
            extra: { ...n },
            status: templateStatus[n.instanceIdentifier],
            stats: stats,
          },
          position: {
            x: n.position.x,
            y: n.position.y,
          },
          locked: true,
          classes: `${n.componentType}`,
        });
      });

      elements = [...elements, ...getLinks(nodes)];

      const cy = cytoscape({
        container: graphContainer.current,
        layout: {
          name: "preset",
          padding: 150,
        },
        elements: elements,
        style: [
          {
            selector: "node.PROCESS_GROUP",
            css: {
              width: "150px",
              height: "100px",
              shape: "round-rectangle",
              "background-opacity": "0",
            },
          },
          {
            selector: "node.PROCESSOR",
            css: {
              width: "55px",
              height: "55px",
            },
          },
          {
            selector: "node.OUTPUT_PORT",
            css: {
              width: "100px",
              height: "30px",
              shape: "round-rectangle",
              "background-opacity": "0",
            },
          },
          {
            selector: "node.INPUT_PORT",
            css: {
              width: "100px",
              height: "30px",
              shape: "round-rectangle",
              "background-opacity": "0",
            },
          },
          {
            selector: "edge",
            css: {
              "line-color": "gray",
            },
          },
          {
            selector: "edge:selected",
            css: {
              "line-color": "gray",
            },
          },

          {
            selector: "edge.filled",
            css: {
              "line-color": "#faad14",
            },
          },
          {
            selector: "edge.warning",
            css: {
              "line-color": "#ff4d4f",
            },
          },
          {
            selector: "edge.hover",
            css: {
              "line-color": "#239df9",
            },
          },
        ],
      });

      //events
      cy.on("click", "node", function () {
        onClick(this.data());
      });

      cy.on("click", "edge", function () {
        onClick(this.data());
      });

      cy.on("mouseover", "node", function (e) {
        e.target.addClass("hover");
      });
      cy.on("mouseout", "node", function (e) {
        e.target.removeClass("hover");
      });

      cy.on("mouseover", "edge", function (e) {
        e.target.addClass("hover");
      });
      cy.on("mouseout", "edge", function (e) {
        e.target.removeClass("hover");
      });

      const statsElements = (statsObj) => {
        return Object.values(statsObj)
          .map(
            (item) => `
          <span class="stats-item" style="background: ${item.color}; opacity: ${
              item.count > 0 ? 1 : 0.3
            }">
            ${item.count}
          </span>
        `
          )
          .join("");
      };

      //labels
      cy.nodeHtmlLabel([
        {
          query: ".PROCESS_GROUP",
          halign: "center",
          valign: "center",
          halignBox: "center",
          valignBox: "center",
          tpl: function (data) {
            return `<div class="group">
                      <span class="group-graphic ">
                        <span class="overlay"></span>
                        <span class="stats">
                          ${statsElements(data.stats)}
                        </span>
                      </span>
                      <span class="group-label">${data.name}</span>
                    </div>`;
          },
        },
        {
          query: ".PROCESS_GROUP.hover",
          halign: "center",
          valign: "center",
          halignBox: "center",
          valignBox: "center",
          tpl: function (data) {
            return `<div class="group">
                      <span class="group-graphic hover">
                        <span class="overlay"></span>
                        <span class="stats">
                          ${statsElements(data.stats)}
                        </span>
                      </span>
                      <span class="group-label">${data.name}</span>
                    </div>`;
          },
        },

        {
          query: ".PROCESSOR",
          halign: "center",
          valign: "center",
          halignBox: "center",
          valignBox: "center",
          tpl: function (data) {
            return `<div class="element">
                      <span class="element-graphic ${data?.status?.runStatus} ${
              data?.status?.bulletinErrors ? "has-error" : ""
            }">
                        <span class="overlay"></span>
                        <span class="overlay-error">Error</span>
                        <span class="element-badge" style="background: ${
                          data.extra?.style["background-color"]
                        }">${
              data?.status?.activeThreadCount > 0
                ? data?.status?.activeThreadCount
                : ""
            }</span>
                      </span>
                      <span class="element-label">${data.name}</span>
                    </div>`;
          },
        },
        {
          query: ".PROCESSOR.hover",
          halign: "center",
          valign: "center",
          halignBox: "center",
          valignBox: "center",
          tpl: function (data) {
            return `<div class="element">
                      <span class="element-graphic hover ${
                        data?.status?.runStatus
                      } ${data?.status?.bulletinErrors ? "has-error" : ""}">
                        <span class="overlay"></span>
                        <span class="overlay-error">Error</span>
                        <span class="element-badge" style="background: ${
                          data.extra?.style["background-color"]
                        }">${
              data?.status?.activeThreadCount > 0
                ? data?.status?.activeThreadCount
                : ""
            }</span>
                      </span>
                      <span class="element-label">${data.name}</span>
                    </div>`;
          },
        },
        {
          query: ".INPUT_PORT, .OUTPUT_PORT",
          halign: "center",
          valign: "center",
          halignBox: "center",
          valignBox: "center",
          tpl: function (data) {
            return `<div class="ioport">
                      <span class="ioport-graphic">
                      </span>
                      <span class="ioport-label">${data.name}</span>
                    </div>`;
          },
        },
      ]);

      const setGroupState = (state, groupData) => {
        const payload = {
          idProcessor: groupData?.extra?.instanceIdentifier,
          actionType: "PUT_PROCESS_GROUP_STATE",
          componentType: "PROCESS_GROUP",
          entity: groupData?.name,
          body: {
            id: groupData?.extra?.instanceIdentifier,
            state,
            disconnectedNodeAcknowledged: true,
          },
        };

        return dispatch(pushQueueRequest(payload)).then((response) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          } else {
            notification.success({
              message: "Solicitação enviada. Aguarde a resposta.",
              placement: "bottom",
            });

            dispatch(setQueueDrawer(true));
          }
        });
      };

      //context menu
      cy.contextMenus({
        evtType: "cxttap",
        menuItems: [
          {
            id: "start",
            content: "Iniciar processos",
            tooltipText: "Iniciar processos",
            selector: ".PROCESS_GROUP",
            image: { src: "/svgs/play.svg", width: 12, height: 12 },
            onClickFunction: (evt) => {
              setGroupState("RUNNING", evt.target.data());
            },
            hasTrailingDivider: true,
          },
          {
            id: "stop",
            content: "Parar processos",
            tooltipText: "Parar processos",
            selector: ".PROCESS_GROUP",
            image: { src: "/svgs/stop.svg", width: 12, height: 12 },
            onClickFunction: (evt) => {
              setGroupState("STOPPED", evt.target.data());
            },
            hasTrailingDivider: true,
          },
          {
            id: "disable",
            content: "Desabilitar processos",
            tooltipText: "Desabilitar processos",
            selector: ".PROCESS_GROUP",
            image: { src: "/svgs/disable.svg", width: 12, height: 12 },
            onClickFunction: (evt) => {
              setGroupState("DISABLED", evt.target.data());
            },
            hasTrailingDivider: true,
          },
          {
            id: "enable",
            content: "Habilitar processos",
            tooltipText: "Habilitar processos",
            selector: ".PROCESS_GROUP",
            image: { src: "/svgs/enable.svg", width: 12, height: 12 },
            onClickFunction: (evt) => {
              setGroupState("ENABLED", evt.target.data());
            },
            hasTrailingDivider: true,
          },

          {
            id: "back",
            content: "Voltar ao nível anterior",
            tooltipText: "Voltar ao nível anterior",
            image: { src: "/svgs/back.svg", width: 12, height: 12 },
            coreAsWell: true,
            onClickFunction: () => {
              goBack();
            },
            hasTrailingDivider: true,
          },
        ],
        menuItemClasses: ["custom-menu-item", "custom-menu-item:hover"],
        contextMenuClasses: ["custom-context-menu"],
      });
    }
  }, [currentGroup, status, template, templateStatus, dispatch]); //eslint-disable-line

  if (!template) {
    return null;
  }

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

  return (
    <GraphContainer className="graph-container">
      <Spin spinning={internalLoading}>
        <div
          ref={graphContainer}
          style={{ height: "100%", width: "100%" }}
        ></div>
      </Spin>

      <NodeModal />

      <GraphHeader
        title={currentGroup ? currentGroup.name : template?.flowContents.name}
        templateDate={formatDateTime(templateDate)}
        templateStatus={templateStatus}
      />
      <GraphActions goBack={goBack} />
    </GraphContainer>
  );
}
