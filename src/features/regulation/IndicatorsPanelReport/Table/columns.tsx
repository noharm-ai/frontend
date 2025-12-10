import { TableProps, Tag } from "antd";

import { formatDate } from "src/utils/date";

const columns = (indicator: string): TableProps<any>["columns"] => {
  const cols: TableProps<any>["columns"] = [
    {
      title: "Nome",
      align: "left",
      render: (_: any, record: any) => {
        return record.name;
      },
    },
    {
      title: "Idade",
      align: "right",
      render: (_: any, record: any) => {
        return record.age ? parseInt(record.age, 10) : "-";
      },
    },
    {
      title: "Unidade",
      align: "center",
      render: (_: any, record: any) => {
        return record.health_unit;
      },
    },
    {
      title: "Agente",
      align: "center",
      render: (_: any, record: any) => {
        return record.health_agent;
      },
    },
  ];

  if (indicator === "MAMMOGRAM_EXAM") {
    cols.push({
      title: "Data do Exame",
      align: "center",
      render: (_: any, record: any) => {
        return formatDate(record.mammogram_appointment_date);
      },
    });

    cols.push({
      title: "Situação",
      align: "center",
      render: (_: any, record: any) => {
        if (record.has_mammogram) {
          return <Tag color="green">Concluído</Tag>;
        }

        return <Tag color="warning">Pendente</Tag>;
      },
    });
  }

  if (indicator === "HPV_VACCINE") {
    cols.push({
      title: "Data da Vacina",
      align: "center",
      render: (_: any, record: any) => {
        return formatDate(record.hpv_vaccine_date);
      },
    });

    cols.push({
      title: "Situação",
      align: "center",
      render: (_: any, record: any) => {
        if (record.has_vaccine) {
          return <Tag color="green">Concluído</Tag>;
        }

        return <Tag color="warning">Pendente</Tag>;
      },
    });
  }

  if (indicator === "HPV_EXAM") {
    cols.push({
      title: "Data do Exame",
      align: "center",
      render: (_: any, record: any) => {
        return formatDate(record.hpv_appointment_date);
      },
    });

    cols.push({
      title: "Situação",
      align: "center",
      render: (_: any, record: any) => {
        if (record.has_hpv) {
          return <Tag color="green">Concluído</Tag>;
        }

        return <Tag color="warning">Pendente</Tag>;
      },
    });
  }

  if (indicator === "SEXUAL_ATTENTION_APPOINTMENT") {
    cols.push({
      title: "Data da Consulta",
      align: "center",
      render: (_: any, record: any) => {
        return formatDate(record.sexattention_appointment_date);
      },
    });

    cols.push({
      title: "Situação",
      align: "center",
      render: (_: any, record: any) => {
        if (record.has_sexattention_appointment) {
          return <Tag color="green">Concluído</Tag>;
        }

        return <Tag color="warning">Pendente</Tag>;
      },
    });
  }

  if (indicator === "GESTATIONAL_APPOINTMENT") {
    cols.push({
      title: "Idade Gestacional",
      align: "center",
      render: (_: any, record: any) => {
        return record.gestational_age;
      },
    });

    cols.push({
      title: "Data da Consulta",
      align: "center",
      render: (_: any, record: any) => {
        return formatDate(record.gestational_appointment_date);
      },
    });

    cols.push({
      title: "Situação",
      align: "center",
      render: (_: any, record: any) => {
        if (record.has_gestational_appointment) {
          return <Tag color="green">Concluído</Tag>;
        }

        return <Tag color="warning">Pendente</Tag>;
      },
    });
  }

  return cols;
};

export default columns;
