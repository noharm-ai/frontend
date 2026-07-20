import { DateGroupView } from "./DateGroupView";
import {
  ApplicabilityNote,
  DetailBody,
  DetailHeader,
  StatusChip,
} from "./ProtocolTrace.style";
import type { IProtocolTraceWithStatus } from "./types";

export function ProtocolDetail({
  protocol,
}: {
  protocol: IProtocolTraceWithStatus;
}) {
  return (
    <>
      <DetailHeader>
        <StatusChip $active={protocol.activated}>
          {protocol.activated ? "ATIVO" : "INATIVO"}
        </StatusChip>
        <span className="protocol-name">{protocol.name}</span>
        <span className="spacer" />
        <span className="date-count">
          {protocol.dateGroups.length} data
          {protocol.dateGroups.length !== 1 ? "s" : ""} avaliada
          {protocol.dateGroups.length !== 1 ? "s" : ""}
        </span>
      </DetailHeader>

      <DetailBody>
        {protocol.applicabilityNotes?.map((note, index) => (
          <ApplicabilityNote key={index}>{note}</ApplicabilityNote>
        ))}
        {protocol.dateGroups.map((group) => (
          <DateGroupView key={group.date} group={group} />
        ))}
      </DetailBody>
    </>
  );
}
