import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import cytoscape from "cytoscape";
import nodeHtmlLabel from "cytoscape-node-html-label";

import Tag from "components/Tag";
import Tooltip from "components/Tooltip";
import NodeModal from "./NodeModal";
import { GraphContainer } from "../IntegrationRemote.style";
import { setSelectedNode } from "../IntegrationRemoteSlice";
import GraphActions from "./GraphActions";
import { formatDateTime } from "utils/date";
import { findProcessGroup } from "../transformer";
import "./graph.css";

nodeHtmlLabel(cytoscape);

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

      if (status?.queuedCount > 0 && status?.queuedCount <= 20) {
        return "filled";
      }

      if (status?.queuedCount > 20) {
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
        elements.push({
          data: {
            id: n.identifier,
            name: n.name,
            extra: { ...n },
            status: templateStatus[n.instanceIdentifier],
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
                        }"></span>
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
                        }"></span>
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
    }
  }, [currentGroup, status, template, templateStatus, dispatch]);

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
    <GraphContainer>
      <Spin spinning={internalLoading}>
        <div
          ref={graphContainer}
          style={{ height: "100%", width: "100%" }}
        ></div>
      </Spin>

      <NodeModal />
      <div className="folder-title">
        {currentGroup ? currentGroup.name : template?.flowContents.name}
      </div>
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
