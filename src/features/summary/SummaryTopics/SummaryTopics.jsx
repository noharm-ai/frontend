import React from "react";
import { useTranslation } from "react-i18next";
import { Anchor } from "antd";

export default function SummaryTopics() {
  const { t } = useTranslation();

  return (
    <Anchor offsetTop={50}>
      <Anchor.Link href="#id-paciente" title={`1) ${t("summary.topic1")}`} />
      <Anchor.Link href="#dados-internacao" title={`2) ${t("summary.topic2")}`}>
        <Anchor.Link href="#admissao" title={`2.1) ${t("summary.topic2-1")}`}>
          <Anchor.Link
            href="#motivo-admissao"
            title={`2.1.1) ${t("summary.topic2-1-1")}`}
          />
          <Anchor.Link
            href="#diagnosticos"
            title={`2.1.2) ${t("summary.topic2-1-2")}`}
          />
          <Anchor.Link
            href="#alergias"
            title={`2.1.3) ${t("summary.topic2-1-3")}`}
          />
          <Anchor.Link
            href="#medicamentos-uso-previo"
            title={`2.1.4) ${t("summary.topic2-1-4")}`}
          />
        </Anchor.Link>

        <Anchor.Link
          href="#resumo-clinico"
          title={`2.2) ${t("summary.topic2-2")}`}
        >
          <Anchor.Link
            href="#exames-lab"
            title={`2.2.1) ${t("summary.topic2-2-1")}`}
          />

          <Anchor.Link
            href="#exames-textuais"
            title={`2.2.2) ${t("summary.topic2-2-2")}`}
          />

          <Anchor.Link
            href="#procedimentos"
            title={`2.2.3) ${t("summary.topic2-2-3")}`}
          />

          <Anchor.Link
            href="#medicamentos-internacao"
            title={`2.2.4) ${t("summary.topic2-2-4")}`}
          />

          <Anchor.Link
            href="#medicamentos-interrompidos"
            title={`2.2.5) ${t("summary.topic2-2-5")}`}
          />
        </Anchor.Link>

        <Anchor.Link
          href="#condicoes-alta"
          title={`2.3) ${t("summary.topic2-3")}`}
        ></Anchor.Link>
      </Anchor.Link>

      <Anchor.Link
        href="#plano-terapeutico"
        title={`3) ${t("summary.topic3")}`}
      >
        <Anchor.Link
          href="#plano-alta"
          title={`3.1) ${t("summary.topic3-1")}`}
        ></Anchor.Link>

        <Anchor.Link
          href="#receita"
          title={`3.2) ${t("summary.topic3-2")}`}
        ></Anchor.Link>
      </Anchor.Link>
    </Anchor>
  );
}
