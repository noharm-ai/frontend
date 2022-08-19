import React from "react";

import { Card } from "./index.style";

export default function PrioritizationCard({ prescription }) {
  return <Card>{prescription.idPrescription}</Card>;
}
