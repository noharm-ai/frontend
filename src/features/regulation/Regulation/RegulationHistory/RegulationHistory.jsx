import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ClockCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { Card, Flex, Timeline } from "antd";

import Button from "components/Button";
import { setActionModal } from "../RegulationSlice";
import { formatDateTime } from "utils/date";

export default function RegulationHistory() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const solicitation = useSelector((state) => state.regulation.regulation.data);
  const movements = useSelector(
    (state) => state.regulation.regulation.data.movements
  );

  const items = [];

  items.push({
    dot: (
      <ClockCircleFilled
        style={{
          fontSize: "16px",
        }}
      />
    ),
    color: "#faad14",
    children: (
      <Flex vertical={true}>
        <div style={{ fontWeight: 500 }}>
          {t(`regulation.stage.${solicitation.stage}`)}
        </div>
        <div style={{ fontWeight: 300, marginTop: "5px" }}>
          <Button type="primary" onClick={() => dispatch(setActionModal(true))}>
            Ação
          </Button>
        </div>
      </Flex>
    ),
  });

  movements.forEach((move, index) => {
    if (move.action === -1) {
      items.push({
        dot: (
          <CheckCircleFilled
            style={{
              fontSize: "16px",
            }}
          />
        ),
        color: "green",
        children: (
          <Flex vertical={true}>
            <div style={{ fontWeight: 500 }}>
              {formatDateTime(move.createdAt)}
            </div>
            <div style={{ fontWeight: 300 }}>Solicitação criada</div>
          </Flex>
        ),
      });
      return;
    }
  });

  // const items = [
  //   {
  //     dot: (
  //       <ClockCircleFilled
  //         style={{
  //           fontSize: "16px",
  //         }}
  //       />
  //     ),
  //     color: "#faad14",
  //     children: (
  //       <Flex vertical={true}>
  //         <div style={{ fontWeight: 500 }}>Aguardando Agendamento</div>
  //         <div style={{ fontWeight: 300, marginTop: "5px" }}>
  //           <Button
  //             type="primary"
  //             onClick={() => dispatch(setActionModal(true))}
  //           >
  //             Ação
  //           </Button>
  //         </div>
  //       </Flex>
  //     ),
  //   },
  //   {
  //     dot: (
  //       <CheckCircleFilled
  //         style={{
  //           fontSize: "16px",
  //         }}
  //       />
  //     ),
  //     color: "green",
  //     children: (
  //       <Flex vertical={true}>
  //         <div style={{ fontWeight: 500 }}>02/10/2024 15:35</div>
  //         <div style={{ fontWeight: 300 }}>
  //           Etapa alterada de <strong>Não Iniciado</strong> para{" "}
  //           <strong>Aguardando Agendamento</strong>
  //         </div>
  //       </Flex>
  //     ),
  //   },
  //   {
  //     dot: (
  //       <CheckCircleFilled
  //         style={{
  //           fontSize: "16px",
  //         }}
  //       />
  //     ),
  //     color: "green",
  //     children: (
  //       <Flex vertical={true}>
  //         <div style={{ fontWeight: 500 }}>01/10/2024 13:35</div>
  //         <div style={{ fontWeight: 300 }}>Solicitação criada</div>
  //       </Flex>
  //     ),
  //   },
  // ];

  return (
    <Card title="Histórico" bordered={false} style={{ height: "100%" }}>
      <Timeline items={items} />
    </Card>
  );
}
