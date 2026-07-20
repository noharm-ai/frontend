import { useMemo, useState } from "react";
import { Input, Segmented } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import { formatDate } from "utils/date";

import { ProtocolDetail } from "./ProtocolDetail";
import {
  EmptyListState,
  FilterBar,
  ListItemMeta,
  ListItemName,
  ListItemText,
  ListStatusDot,
  ProtocolDetailPanel,
  ProtocolListItem,
  ProtocolListPanel,
  ProtocolListScroll,
  StatusPill,
  TraceBody,
  TraceHeader,
  TraceRoot,
} from "./ProtocolTrace.style";
import type {
  IPrescriptionTrace,
  IProtocolTraceWithStatus,
  StatusFilter,
} from "./types";

export function ProtocolTrace({ trace }: { trace: IPrescriptionTrace }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pickedId, setPickedId] = useState<number | null>(null);

  const protocolsWithStatus: IProtocolTraceWithStatus[] = useMemo(
    () =>
      trace.protocols.map((p) => ({
        ...p,
        activated: p.dateGroups.some((g) => g.activated),
      })),
    [trace.protocols]
  );

  const applicableCount = trace.protocols.filter((p) => p.applicable).length;
  const activatedCount = protocolsWithStatus.filter((p) => p.activated).length;
  const inactiveCount = trace.protocols.length - activatedCount;

  const filtered = useMemo(
    () =>
      protocolsWithStatus.filter((p) => {
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        if (statusFilter === "active" && !p.activated) {
          return false;
        }
        if (statusFilter === "inactive" && p.activated) {
          return false;
        }
        return true;
      }),
    [protocolsWithStatus, search, statusFilter]
  );

  const selectedId = filtered.some((p) => p.idProtocol === pickedId)
    ? pickedId
    : (filtered[0]?.idProtocol ?? null);
  const selectedProtocol = filtered.find((p) => p.idProtocol === selectedId);

  return (
    <TraceRoot>
      <TraceHeader>
        <span>Prescrição #{trace.idPrescription}</span>
        <span className="divider">·</span>
        <span>
          Avaliada em {formatDate(trace.evaluatedAt)} às{" "}
          {formatDate(trace.evaluatedAt, "HH:mm")}
        </span>
        <span className="divider">·</span>
        <span>{applicableCount} protocolos aplicáveis</span>
        <span className="divider">·</span>
        <StatusPill $variant="activated">{activatedCount} ativo</StatusPill>
        <StatusPill $variant="inactive">{inactiveCount} inativos</StatusPill>
      </TraceHeader>

      <TraceBody>
        <ProtocolListPanel>
          <FilterBar>
            <Input
              size="small"
              allowClear
              placeholder="Buscar protocolo..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Segmented
              size="small"
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as StatusFilter)}
              options={[
                { label: "Todos", value: "all" },
                { label: "Ativos", value: "active" },
                { label: "Inativos", value: "inactive" },
              ]}
            />
          </FilterBar>

          <ProtocolListScroll>
            {filtered.length === 0 ? (
              <EmptyListState>Nenhum protocolo encontrado</EmptyListState>
            ) : (
              filtered.map((protocol) => (
                <ProtocolListItem
                  key={protocol.idProtocol}
                  $selected={protocol.idProtocol === selectedId}
                  onClick={() => setPickedId(protocol.idProtocol)}
                >
                  <ListStatusDot $active={protocol.activated} />
                  <ListItemText>
                    <ListItemName>{protocol.name}</ListItemName>
                    {!protocol.applicable && (
                      <ListItemMeta>não aplicável</ListItemMeta>
                    )}
                  </ListItemText>
                </ProtocolListItem>
              ))
            )}
          </ProtocolListScroll>
        </ProtocolListPanel>

        <ProtocolDetailPanel>
          {selectedProtocol ? (
            <ProtocolDetail protocol={selectedProtocol} />
          ) : (
            <EmptyListState>Selecione um protocolo à esquerda</EmptyListState>
          )}
        </ProtocolDetailPanel>
      </TraceBody>
    </TraceRoot>
  );
}
