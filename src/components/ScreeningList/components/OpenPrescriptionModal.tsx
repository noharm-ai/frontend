import { useState } from "react";

import Button from "components/Button";

interface IOpenPrescriptionModalProps {
  chunks: any[];
  openPrescriptionList: (chunk: number[]) => void;
}

export function OpenPrescriptionModal({
  chunks,
  openPrescriptionList,
}: IOpenPrescriptionModalProps) {
  const [clicked, setClicked] = useState<number[]>([]);

  const open = (chunk: number[], index: number) => {
    openPrescriptionList(chunk);
    setClicked((prevState) => [...prevState, index]);
  };

  return (
    <>
      <p>As prescrições foram divididas em grupos com 20 registros.</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "50% 50%",
          gap: "10px",
        }}
      >
        {chunks.map((chunk, index) => (
          <Button
            onClick={() => open(chunk, index)}
            block
            key={index}
            type={clicked.indexOf(index) !== -1 ? "primary" : "default"}
          >
            Abrir grupo {index + 1}
          </Button>
        ))}
      </div>
    </>
  );
}
