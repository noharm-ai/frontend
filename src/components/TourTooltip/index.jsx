import React, { useState } from "react";
import { Tooltip, Modal } from "antd";
import { BookOutlined, LinkOutlined } from "@ant-design/icons";
import { useTour } from "../../context/TourContext";

const HIGHLIGHT_STYLE = `
  @keyframes tourPulse {
    0%, 100% { outline-color: rgba(169, 145, 214, 0.5); }
    50% { outline-color: rgba(169, 145, 214, 1); }
  }
  .tour-highlight {
    display: inline-block;
    width: 100%;
    outline: 2px dashed rgba(169, 145, 214, 0.5);
    outline-offset: 3px;
    border-radius: 4px;
    cursor: help;
    animation: tourPulse 2s ease-in-out infinite;
  }
  .ant-menu-item .tour-highlight,
  .ant-menu-submenu-title .tour-highlight,
  .ant-tabs-tab .tour-highlight {
    display: inline;
    width: auto;
  }
`;

const injectStyle = () => {
  if (document.getElementById("tour-highlight-styles")) return;
  const el = document.createElement("style");
  el.id = "tour-highlight-styles";
  el.textContent = HIGHLIGHT_STYLE;
  document.head.appendChild(el);
};
};

const TourTooltip = ({ title, description, details, articleUrl, children }) => {
  const { tutorialMode } = useTour();
  const [modalOpen, setModalOpen] = useState(false);

  if (!tutorialMode) return children;

  injectStyle();

  return (
    <>
      <Tooltip
        title={
          <div style={{ maxWidth: 280 }}>
            <div
              onClick={() => setModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
                cursor: "pointer",
              }}
            >
              <BookOutlined style={{ color: "#a991d6" }} />
              <strong style={{ textDecoration: "underline dotted" }}>
                {title}
              </strong>
            </div>
            <div style={{ fontSize: 12 }}>{description}</div>
          </div>
        }
        open={tutorialMode && !modalOpen ? undefined : false}
        placement="bottom"
        color="#2d2d2d"
        mouseLeaveDelay={0.3}
      >
        <span className="tour-highlight">{children}</span>
      </Tooltip>

      <Modal
        title={
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BookOutlined style={{ color: "#a991d6" }} />
            {title}
          </span>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={480}
      >
        <p style={{ marginBottom: articleUrl ? 16 : 0 }}>
          {details || description}
        </p>
        {articleUrl && (
          <a
            href={`${import.meta.env.VITE_APP_ODOO_LINK}${articleUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <LinkOutlined /> Ver artigo na base de conhecimento
          </a>
        )}
      </Modal>
    </>
  );
};

export default TourTooltip;
