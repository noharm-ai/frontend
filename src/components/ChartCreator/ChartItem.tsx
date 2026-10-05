import {
  DragEvent,
  PointerEvent,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Badge, Col, Card, Space, Button, Modal, Tooltip, theme } from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  FullscreenOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import { EChartBase } from "src/components/EChartBase";
import { ChartConfig, ColumnSchema } from "./types";
import { getChartOption } from "./utils";
import { applyFilters } from "src/utils/dataFilters";
import { ChartFilterPanel } from "./ChartFilterPanel";
import {
  CHART_DRAG_TYPE,
  CHART_GUTTER,
  CHART_HEIGHT,
  ChartWidth,
  DropSide,
  snapHeight,
  snapWidth,
  WIDTH_LABEL,
  WIDTH_SPAN,
} from "./chartLayout";
import {
  ChartFrame,
  DragHandle,
  ResizeHandle,
  ResizeLabel,
  ResizePreview,
  ResizingCursor,
} from "./ChartItem.style";

// How far past the row's end the corner must go to fill the row: a chart that
// already ends there has no room to grow by dragging.
const PAST_ROW_EDGE = 16;

type ChartSize = { width: ChartWidth; height: number };

/** Reorder and resize callbacks shared by every chart. Pass a memoized object. */
export interface ChartLayoutHandlers {
  onMove: (id: string, offset: -1 | 1) => void;
  onDragStart: (id: string) => void;
  onDragOver: (id: string, side: DropSide) => void;
  onDragLeave: (id: string) => void;
  onDrop: (id: string, targetId: string, side: DropSide) => void;
  onDragEnd: () => void;
  onResize: (id: string, size: Partial<ChartSize>) => void;
}

interface ChartItemProps {
  chart: ChartConfig;
  data: any[];
  schema: ColumnSchema[];
  onEdit: (chart: ChartConfig) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
  layout?: ChartLayoutHandlers;
  isFirst?: boolean;
  isLast?: boolean;
  /** This chart is the one being dragged. */
  dragging?: boolean;
  /** Where a chart dragged over this one would land. */
  dropSide?: DropSide | null;
}

export const ChartItem = memo(
  ({
    chart,
    data,
    schema,
    onEdit,
    onRemove,
    readOnly,
    layout,
    isFirst,
    isLast,
    dragging = false,
    dropSide = null,
  }: ChartItemProps) => {
    const filteredData = useMemo(
      () => applyFilters(data, chart.filters ?? [], schema),
      [data, chart.filters, schema],
    );
    const option = useMemo(() => getChartOption(filteredData, chart), [filteredData, chart]);
    const [fullscreen, setFullscreen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const activeFilterCount = chart.filters?.length ?? 0;
    const height = chart.height ?? CHART_HEIGHT.initial;
    // EChartBase rebuilds the chart whenever it re-renders (inline onClick),
    // so drag and reorder re-renders reuse this element and leave it alone; a
    // new option still rebuilds it at the chart's current size.
    const canvas = useMemo(
      () => (
        <EChartBase
          option={option}
          style={{ height: `${height}px`, width: "100%" }}
          loading={false}
          settings={{}}
          theme={undefined}
          onClick={() => {}}
        />
      ),
      [option, height],
    );
    const frameRef = useRef<HTMLDivElement>(null);
    const { token } = theme.useToken();
    const resizeStart = useRef<{
      x: number;
      y: number;
      card: DOMRect;
      row: DOMRect;
    } | null>(null);
    const [resize, setResize] = useState<
      (ChartSize & { left: number; widthPx: number; heightPx: number }) | null
    >(null);
    const resizing = resize !== null;

    // full-width charts stack, so they move up/down; the others flow sideways
    const vertical = chart.width === "full";
    const sortable = !readOnly && layout && !(isFirst && isLast);
    const resizable = !readOnly && layout;

    const sideOf = (event: DragEvent): DropSide => {
      const rect = frameRef.current!.getBoundingClientRect();
      const before = vertical
        ? event.clientY < rect.top + rect.height / 2
        : event.clientX < rect.left + rect.width / 2;
      return before ? "before" : "after";
    };

    const handleDragStart = (event: DragEvent) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(CHART_DRAG_TYPE, chart.id);

      // drag the whole card, held where the pointer grabbed it
      const frame = frameRef.current;
      if (frame) {
        const rect = frame.getBoundingClientRect();
        event.dataTransfer.setDragImage(
          frame,
          event.clientX - rect.left,
          event.clientY - rect.top,
        );
      }

      // deferred: fading the card before the browser takes the drag image
      // would fade the ghost too
      setTimeout(() => layout?.onDragStart(chart.id));
    };

    const handleDragOver = (event: DragEvent) => {
      if (!event.dataTransfer.types.includes(CHART_DRAG_TYPE)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      layout?.onDragOver(chart.id, sideOf(event));
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
        layout?.onDragLeave(chart.id);
      }
    };

    const handleDrop = (event: DragEvent) => {
      const draggedId = event.dataTransfer.getData(CHART_DRAG_TYPE);
      if (!draggedId) return;
      event.preventDefault();
      layout?.onDrop(draggedId, chart.id, sideOf(event));
    };

    // The corner stands for the card's bottom-right: the width snaps to the
    // share of the row it reaches, the height to the editor's step.
    const sizeAt = (event: PointerEvent): ChartSize => {
      const { x, y, card, row } = resizeStart.current!;
      const right = card.right + event.clientX - x;
      const pastRowEdge = right > row.right - CHART_GUTTER / 2 + PAST_ROW_EDGE;
      return {
        width: pastRowEdge
          ? "full"
          : snapWidth((right - card.left + CHART_GUTTER) / row.width),
        height: snapHeight(height + event.clientY - y),
      };
    };

    const previewOf = ({ width, height: newHeight }: ChartSize) => {
      const { card, row } = resizeStart.current!;
      const widthPx = (WIDTH_SPAN[width] / 24) * row.width - CHART_GUTTER;
      const rowEnd = row.right - CHART_GUTTER / 2;
      return {
        width,
        height: newHeight,
        // too wide to fit from here: the chart will wrap, so end it at the
        // row's end instead of past it
        left: Math.min(0, rowEnd - (card.left + widthPx)),
        widthPx,
        heightPx: card.height + newHeight - height,
      };
    };

    const handleResizeStart = (event: PointerEvent<HTMLElement>) => {
      const frame = frameRef.current;
      const row = frame?.closest(".ant-row");
      if (event.button !== 0 || !frame || !row) return;

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      resizeStart.current = {
        x: event.clientX,
        y: event.clientY,
        card: frame.getBoundingClientRect(),
        row: row.getBoundingClientRect(),
      };
      setResize(previewOf({ width: chart.width, height }));
    };

    const handleResizeMove = (event: PointerEvent) => {
      if (!resizeStart.current) return;
      const size = sizeAt(event);
      setResize((prev) =>
        prev?.width === size.width && prev.height === size.height
          ? prev
          : previewOf(size),
      );
    };

    const cancelResize = () => {
      resizeStart.current = null;
      setResize(null);
    };

    // sized from the release point, not the preview, which may lag a move
    const handleResizeEnd = (event: PointerEvent) => {
      if (!resizeStart.current) return;
      const size = sizeAt(event);
      cancelResize();

      const changed: Partial<ChartSize> = {
        ...(size.width !== chart.width && { width: size.width }),
        ...(size.height !== height && { height: size.height }),
      };
      if (Object.keys(changed).length > 0) layout?.onResize(chart.id, changed);
    };

    useEffect(() => {
      if (!resizing) return;
      const cancelOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") cancelResize();
      };
      window.addEventListener("keydown", cancelOnEscape);
      return () => window.removeEventListener("keydown", cancelOnEscape);
    }, [resizing]);

    return (
      <Col
        key={chart.id}
        span={WIDTH_SPAN[chart.width] ?? WIDTH_SPAN.half}
        onDragOver={sortable ? handleDragOver : undefined}
        onDragLeave={sortable ? handleDragLeave : undefined}
        onDrop={sortable ? handleDrop : undefined}
      >
        <ChartFrame
          ref={frameRef}
          $dragging={dragging}
          $dropSide={dropSide}
          $vertical={vertical}
          $accent={token.colorPrimary}
        >
          <Card
            title={
              sortable ? (
                <DragHandle
                  draggable
                  onDragStart={handleDragStart}
                  onDragEnd={layout.onDragEnd}
                >
                  <HolderOutlined title="Arraste para reordenar" />
                  {chart.title}
                </DragHandle>
              ) : (
                chart.title
              )
            }
            type="inner"
            extra={
              <Space>
                {sortable && (
                  <>
                    <Tooltip title="Mover para antes">
                      <Button
                        type="text"
                        aria-label="Mover para antes"
                        icon={vertical ? <ArrowUpOutlined /> : <ArrowLeftOutlined />}
                        disabled={isFirst}
                        onClick={() => layout.onMove(chart.id, -1)}
                      />
                    </Tooltip>
                    <Tooltip title="Mover para depois">
                      <Button
                        type="text"
                        aria-label="Mover para depois"
                        icon={vertical ? <ArrowDownOutlined /> : <ArrowRightOutlined />}
                        disabled={isLast}
                        onClick={() => layout.onMove(chart.id, 1)}
                      />
                    </Tooltip>
                  </>
                )}
                <Button
                  type="text"
                  icon={<FullscreenOutlined />}
                  onClick={() => setFullscreen(true)}
                />
                {readOnly && activeFilterCount > 0 && (
                  <Badge count={activeFilterCount} size="small">
                    <Button
                      type="text"
                      icon={<FilterOutlined />}
                      onClick={() => setFilterModalOpen(true)}
                    >
                      Filtros
                    </Button>
                  </Badge>
                )}
                {!readOnly && (
                  <>
                    <Button
                      type="link"
                      onClick={() => onEdit(chart)}
                      icon={<EditOutlined />}
                    >
                      Editar
                    </Button>
                    <Button
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => onRemove(chart.id)}
                    >
                      Remover
                    </Button>
                  </>
                )}
              </Space>
            }
          >
            {canvas}
          </Card>

          {resizable && (
            <ResizeHandle
              title="Arraste para redimensionar"
              $color={token.colorTextQuaternary}
              $accent={token.colorPrimary}
              onPointerDown={handleResizeStart}
              onPointerMove={handleResizeMove}
              onPointerUp={handleResizeEnd}
              onPointerCancel={cancelResize}
            />
          )}
          {resize && (
            <>
              <ResizingCursor />
              <ResizePreview
                $accent={token.colorPrimary}
                style={{
                  left: resize.left,
                  width: resize.widthPx,
                  height: resize.heightPx,
                }}
              >
                <ResizeLabel $accent={token.colorPrimary}>
                  {WIDTH_LABEL[resize.width]} · {resize.height}px
                </ResizeLabel>
              </ResizePreview>
            </>
          )}
        </ChartFrame>

        <Modal
          open={fullscreen}
          onCancel={() => setFullscreen(false)}
          footer={null}
          title={chart.title}
          width="100vw"
          style={{ top: 0, padding: 0, maxWidth: "100vw" }}
          styles={{ body: { height: "calc(100vh - 55px)", padding: 8 } }}
          destroyOnHidden
        >
          <EChartBase
            option={option}
            style={{ height: "100%", width: "100%" }}
            loading={false}
            settings={{}}
            theme={undefined}
            onClick={() => {}}
          />
        </Modal>

        <Modal
          open={filterModalOpen}
          onCancel={() => setFilterModalOpen(false)}
          footer={null}
          title="Filtros aplicados"
        >
          <ChartFilterPanel
            filters={chart.filters ?? []}
            schema={schema}
            readOnly={true}
            onChange={() => {}}
          />
        </Modal>
      </Col>
    );
  },
);
