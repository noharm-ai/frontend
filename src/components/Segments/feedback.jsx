import React from "react";

import notification from "components/notification";

// success message when generate outlier.
const message = {
  success: (nameSegment) => ({
    message: "Outlier gerado com sucesso!",
    description: (
      <p>
        Uhu! Outlier gerado com sucesso para o segmento: <b>{nameSegment}</b>
      </p>
    ),
  }),
};

export default function feedback(status, { nameSegment }) {
  const type = status === 200 ? "success" : "error";

  notification[type](message[type](nameSegment));
}
