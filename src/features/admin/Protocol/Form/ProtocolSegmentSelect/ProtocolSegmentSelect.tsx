import { useEffect, useId, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Select } from "components/Inputs";
import { fetchSegmentsListThunk } from "store/ducks/segments/thunk";

interface Segment {
  id: string | number;
  description: string;
}

interface ProtocolSegmentSelectProps {
  value?: Array<string | number>;
  onChange: (ids: Array<string | number>) => void;
}

export function ProtocolSegmentSelect({
  value,
  onChange,
}: ProtocolSegmentSelectProps) {
  const dispatch = useDispatch<any>();
  const containerId = `protocol-segment-select-${useId().replace(/:/g, "")}`;
  const segments: Segment[] = useSelector(
    (state: any) => state.segments.list ?? [],
  );

  // The segment list is a small, bounded operational set. The thunk short-circuits
  // when the list is already cached, so dispatching on mount is safe/idempotent.
  useEffect(() => {
    dispatch(fetchSegmentsListThunk());
  }, [dispatch]);

  const options = useMemo(
    () =>
      segments.map((s) => ({
        label: `${s.description} (${s.id})`,
        value: s.id,
      })),
    [segments],
  );

  // The value can arrive as a non-array (e.g. a stale string left before an
  // operator is picked); ignore anything that is not a proper id list.
  const ids = Array.isArray(value) ? value : [];

  return (
    <div id={containerId} style={{ width: "100%" }}>
      <Select
        value={ids}
        onChange={(val) => onChange(val as Array<string | number>)}
        mode="multiple"
        showSearch
        allowClear
        optionFilterProp="label"
        options={options}
        style={{ width: "100%" }}
        placeholder="Digite para pesquisar"
        maxTagCount={10}
        getPopupContainer={() =>
          document.getElementById(containerId) as HTMLElement
        }
      />
    </div>
  );
}
