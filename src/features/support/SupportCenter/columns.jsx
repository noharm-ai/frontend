import React from "react";
import { EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Tag from "components/Tag";

const columns = (t) => {
  const openTicket = (record) => {
    const link = `${import.meta.env.VITE_APP_ODOO_LINK}my/ticket/${
      record.id
    }?access_token=${record.access_token}`;
    window.open(link, "_blank");

    //   const modal = DefaultModal.info({
    //     content: null,
    //     icon: null,
    //     closable: false,
    //     width: "80vw",
    //     okText: "Fechar",
    //     okButtonProps: { type: "default" },
    //     wrapClassName: "iframe-modal",
    //     style: { top: "10px" },
    //   });

    //   modal.update({
    //     content: (
    //       <>
    //         <div style={{ display: "flex", justifyContent: "flex-end" }}>
    //           <Space>
    //             <Tooltip title="Abrir em nova janela">
    //               <Button
    //                 type="primary"
    //                 icon={<LinkOutlined />}
    //                 onClick={() => window.open(link, "_blank")}
    //                 shape="circle"
    //               ></Button>
    //             </Tooltip>
    //             <Tooltip title="Fechar">
    //               <Button
    //                 shape="circle"
    //                 icon={<CloseOutlined />}
    //                 onClick={() => modal.destroy()}
    //               ></Button>
    //             </Tooltip>
    //           </Space>
    //         </div>
    //         <iframe
    //           style={{ border: 0, width: "100%", height: "80vh" }}
    //           src={link}
    //           title="ticket"
    //         ></iframe>
    //       </>
    //     ),
    //   });
  };

  const Status = ({ status }) => {
    const config = {};

    switch (status) {
      case 1:
        config.label = "Novo";
        config.color = "cyan";
        break;
      case 10:
        config.label = "Em análise";
        config.color = "purple";
        break;
      case 13:
        config.label = "Atribuído";
        config.color = "processing";
        break;
      case 2:
        config.label = "Em andamento";
        config.color = "processing";
        break;
      case 3:
        config.label = "Em espera";
        config.color = "orange";
        break;

      case 12:
        config.label = "Resolvido";
        config.color = "success";
        break;
      case 4:
        config.label = "Encerrado";
        config.color = "success";
        break;
      case 5:
        config.label = "Cancelado";
        config.color = "default";
        break;
      case 14:
        config.label = "Refinamento";
        config.color = "processing";
        break;
      default:
        config.label = status;
        config.color = "default";
    }

    return <Tag color={config.color}>{config.label}</Tag>;
  };

  return [
    {
      title: "Ref",
      render: (entry, record) => {
        return record.ticket_ref;
      },
    },
    {
      title: "Título",
      align: "left",
      render: (entry, record) => {
        const noReturnTagId = 23;
        return (
          <>
            {record.name}{" "}
            {record.tag_ids && record.tag_ids.indexOf(noReturnTagId) !== -1 && (
              <>
                <Tag color="error" style={{ marginLeft: "5px" }}>
                  Aguardando resposta
                </Tag>
              </>
            )}
          </>
        );
      },
    },
    {
      title: "Criado em",
      align: "center",
      render: (entry, record) => {
        return record.create_date
          ? dayjs(record.create_date).format("DD/MM/YYYY")
          : "";
      },
    },
    {
      title: "Situação",
      align: "center",
      render: (entry, record) => {
        return <Status status={record.stage_id[0]} />;
      },
    },

    {
      title: t("tableHeader.action"),
      key: "operations",
      width: 70,
      align: "center",
      render: (text, record) => {
        return (
          <Tooltip title="Acompanhar este chamado">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openTicket(record)}
            ></Button>
          </Tooltip>
        );
      },
    },
  ];
};

export default columns;
