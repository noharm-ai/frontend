import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import api from "services/api";
import adminApi from "services/admin/api";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";
import {
  LabelKind,
  LabelLookup,
  collectLabelRequests,
} from "components/ProtocolDescription/labels";

import {
  formatSubstanceLabel,
  normalizeSubstance,
} from "../ProtocolSubstanceSelect/helpers";
import { formatSubstanceClassLabel } from "../ProtocolSubstanceClassSelect/helpers";
import { formatDrugLabel, normalizeDrug } from "../ProtocolDrugSelect/helpers";
import { formatIcdLabel, normalizeIcd } from "../ProtocolIcdSelect/helpers";
import {
  formatDepartmentLabel,
  normalizeDepartment,
} from "../ProtocolDepartmentSelect/helpers";

type LabelMap = Record<string, string>;

// Ids arrive from the whole variable set at once, which is longer than any
// single select's query string — chunk so a big substance list cannot blow the
// URL length limit.
const RESOLVE_CHUNK = 100;

const chunk = <T,>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }

  return chunks;
};

const fromEntries = (
  items: any[],
  toEntry: (item: any) => [string, string] | null
): LabelMap => {
  const map: LabelMap = {};

  items.forEach((item) => {
    const entry = toEntry(item);
    if (entry) {
      map[entry[0]] = entry[1];
    }
  });

  return map;
};

interface IStrategy {
  // "resolve" asks the backend for a specific set of ids; "list" pulls a
  // bounded lookup table once and answers every id from it.
  mode: "resolve" | "list";
  load: (ids: string[]) => Promise<LabelMap>;
}

const STRATEGIES: Record<Exclude<LabelKind, "segment">, IStrategy> = {
  substance: {
    mode: "resolve",
    load: (ids) =>
      api.substance.resolveSubstances(ids).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) => {
          const option = normalizeSubstance(item);
          return [String(option.id), formatSubstanceLabel(option)];
        })
      ),
  },
  class: {
    mode: "resolve",
    load: (ids) =>
      api.substance.resolveSubstanceClasses(ids).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) =>
          item?.id == null
            ? null
            : [String(item.id), formatSubstanceClassLabel(item)]
        )
      ),
  },
  drug: {
    mode: "resolve",
    load: (ids) =>
      api.drugs.resolveDrugs(ids).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) => {
          const option = normalizeDrug(item);
          return [String(option.id), formatDrugLabel(option)];
        })
      ),
  },
  icd: {
    mode: "resolve",
    load: (ids) =>
      api.lists.resolveIcds(ids).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) => {
          const option = normalizeIcd(item);
          return [String(option.id), formatIcdLabel(option)];
        })
      ),
  },
  department: {
    mode: "list",
    load: () =>
      adminApi.protocols.getDepartments({}).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) => {
          const option = normalizeDepartment(item);
          return [String(option.id), formatDepartmentLabel(option)];
        })
      ),
  },
  route: {
    mode: "list",
    load: () =>
      api.lists.getRoutes().then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) => {
          if (item?.id == null) return null;

          const id = String(item.id);
          const name = item.name != null ? String(item.name) : id;

          return [id, name === id ? id : `${name} (${id})`];
        })
      ),
  },
  exam: {
    mode: "list",
    load: () =>
      api.exams.getExamTypes({}).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) =>
          item?.examType == null
            ? null
            : [String(item.examType), `${item.name} (${item.examType})`]
        )
      ),
  },
  examRef: {
    mode: "list",
    load: () =>
      adminApi.exams.getGlobalExams({}).then((response: any) =>
        fromEntries(response.data?.data ?? [], (item) =>
          item?.tpexam == null
            ? null
            : [String(item.tpexam), `${item.name} (${item.tpexam})`]
        )
      ),
  },
};

// Module-level so switching between the "Visual" and "Assistente IA" tabs
// (which destroy the panel) does not re-request everything.
const cache: Partial<Record<LabelKind, LabelMap>> = {};
const requested: Partial<Record<LabelKind, Set<string>>> = {};
const listLoads: Partial<Record<LabelKind, Promise<void>>> = {};

const cacheOf = (kind: LabelKind): LabelMap => {
  if (!cache[kind]) {
    cache[kind] = {};
  }

  return cache[kind] as LabelMap;
};

const requestedOf = (kind: LabelKind): Set<string> => {
  if (!requested[kind]) {
    requested[kind] = new Set();
  }

  return requested[kind] as Set<string>;
};

/**
 * Resolves the human descriptions behind the ids stored in protocol variables.
 *
 * Failures are swallowed on purpose: every select already surfaces its own
 * error notification for the same endpoints, and the caller degrades to
 * showing the bare id.
 */
export function useItemLabels(variables: any[]) {
  const dispatch = useDispatch<any>();
  const segments = useSelector((state: any) => state.segments.list ?? []);
  const [version, bumpVersion] = useReducer((v: number) => v + 1, 0);
  const [loadingCount, setLoadingCount] = useState(0);

  const requests = useMemo(() => collectLabelRequests(variables), [variables]);
  const requestsKey = JSON.stringify(requests);

  // The segment list is small and cached by the thunk, so dispatching on mount
  // is idempotent.
  useEffect(() => {
    dispatch(fetchSegmentsListThunk());
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    const pending: Array<Promise<unknown>> = [];

    const track = (promise: Promise<unknown>) => {
      setLoadingCount((count) => count + 1);
      pending.push(
        promise.finally(() => {
          if (active) {
            setLoadingCount((count) => count - 1);
            bumpVersion();
          }
        })
      );
    };

    (Object.keys(requests) as LabelKind[]).forEach((kind) => {
      if (kind === "segment") return;

      const strategy = STRATEGIES[kind as Exclude<LabelKind, "segment">];
      const ids = requests[kind] ?? [];

      if (strategy.mode === "list") {
        if (!listLoads[kind]) {
          listLoads[kind] = strategy
            .load([])
            .then((map) => {
              Object.assign(cacheOf(kind), map);
            })
            // The settled promise stays cached even when it failed, so a
            // broken endpoint is hit once and the sentence falls back to the
            // bare ids — same one-shot behaviour as the selects. A page reload
            // retries.
            .catch(() => undefined);
        }

        track(listLoads[kind] as Promise<void>);
        return;
      }

      const seen = requestedOf(kind);
      const missing = ids.filter((id) => !seen.has(id));

      if (!missing.length) return;

      missing.forEach((id) => seen.add(id));

      chunk(missing, RESOLVE_CHUNK).forEach((ids) => {
        track(
          strategy
            .load(ids)
            .then((map) => {
              Object.assign(cacheOf(kind), map);
            })
            // Failed ids stay marked as requested so a broken endpoint is not
            // hit again on every edit; they render as bare ids until reload.
            .catch(() => undefined)
        );
      });
    });

    return () => {
      active = false;
    };
    // `requestsKey` is the stable identity of `requests`; `bumpVersion` is
    // reducer-stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestsKey]);

  const getLabel = useCallback<LabelLookup>(
    (kind, id) => {
      const key = String(id);

      if (kind === "segment") {
        const segment = segments.find((s: any) => String(s.id) === key);

        return segment ? `${segment.description} (${segment.id})` : undefined;
      }

      return cacheOf(kind)[key];
    },
    // `version` is what makes this callback (and therefore the sentence)
    // re-read the module cache after a batch lands.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segments, version]
  );

  return { getLabel, resolving: loadingCount > 0 };
}
