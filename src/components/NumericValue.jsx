import React from "react";
import { NumericFormat } from "react-number-format";

export default function NumericValue(props) {
  return (
    <NumericFormat
      displayType="text"
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={3}
      {...props}
    />
  );
}
