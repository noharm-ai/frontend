import React from "react";
import { Anchor } from "antd";

export default function SummaryTopics() {
  return (
    <Anchor offsetTop={50}>
      <Anchor.Link href="#id-paciente" title="1) IDENTIFICAÇÃO DO PACIENTE" />
      <Anchor.Link href="#dados-internacao" title="2) DADOS DA INTERNAÇÃO">
        <Anchor.Link href="#admissao" title="2.1) Admissão">
          <Anchor.Link
            href="#motivo-admissao"
            title="2.1.1) Motivo da Admissão"
          />
          <Anchor.Link
            href="#diagnosticos"
            title="2.1.2) Diagnósticos (primário e secundário)"
          />
          <Anchor.Link href="#alergias" title="2.1.3) Alergias" />
          <Anchor.Link
            href="#medicamentos-uso-previo"
            title="2.1.4) Medicamentos de uso prévio"
          />
        </Anchor.Link>

        <Anchor.Link href="#resumo-clinico" title="2.2) Resumo Clínico">
          <Anchor.Link href="#exames-lab" title="2.2.1) Exames Laboratoriais" />

          <Anchor.Link href="#exames-textuais" title="2.2.2) Exames Textuais" />

          <Anchor.Link
            href="#procedimentos"
            title="2.2.3) Procedimentos Realizados"
          />

          <Anchor.Link
            href="#medicamentos-internacao"
            title="2.2.4) Medicamentos utilizados na internação"
          />

          <Anchor.Link
            href="#medicamentos-interrompidos"
            title="2.2.5) Medicamentos interrompidos"
          />
        </Anchor.Link>

        <Anchor.Link
          href="#condicoes-alta"
          title="2.3) Condições de Alta"
        ></Anchor.Link>
      </Anchor.Link>

      <Anchor.Link href="#plano-terapeutico" title="3) PLANO TERAPÊUTICO">
        <Anchor.Link
          href="#plano-alta"
          title="3.1) Plano de Alta"
        ></Anchor.Link>

        <Anchor.Link href="#receita" title="3.2) Receita"></Anchor.Link>
      </Anchor.Link>
    </Anchor>
  );
}
