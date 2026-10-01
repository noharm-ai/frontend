import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { matchRoutes, RouteObject, useLocation } from "react-router-dom";
import { theme } from "antd";

import { useAppDispatch, useAppSelector } from "src/store";
import Permission from "models/Permission";

import notification from "components/notification";

import { useArticleModal } from "../../useArticleModal";
import {
  fetchHelpElements,
  GLOBAL_PAGE,
  IHelpElement,
  openHelpElementEditor,
  saveHelpElement,
  setHelpModeActive,
  setHelpModePage,
  setHelpModePicking,
} from "../HelpModeSlice";
import {
  HELP_LAYER_ID,
  IPickedElement,
  isFragileSelector,
  isInsideHelpLayer,
} from "../helpDom";
import { useHelpTargets } from "../useHelpTargets";
import { HelpModeHighlight } from "../HelpModeHighlight/HelpModeHighlight";
import { HelpModePicker } from "../HelpModePicker/HelpModePicker";
import { HelpModeBar } from "../HelpModeBar/HelpModeBar";
import { HelpElementEditor } from "../HelpElementEditor/HelpElementEditor";
import { LayerRoot } from "./HelpModeLayer.style";

const EMPTY: IHelpElement[] = [];
const NO_PERMISSIONS: string[] = [];

// how long a stepped-aside highlight waits for the pointer to reach its element
const ASIDE_TIMEOUT = 10000;

const elementKey = (item: IHelpElement) => `${item.page}|${item.selector}`;

interface IHelpModeLayerProps {
  // the app's routes map: a screen is known by its route pattern, so help
  // pinned on one prescription shows on every prescription
  routes: RouteObject[];
}

/**
 * Help mode, mounted once app-wide: while it is on, the elements of the
 * current screen with pinned articles are highlighted, and a click on one
 * shows its articles instead of reaching the element. Curators (the
 * WRITE_HELP_TEXT permission) also pin articles to elements from here.
 *
 * Switched on by HelpModeToggle, in the header.
 */
export function HelpModeLayer({ routes }: IHelpModeLayerProps) {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { openArticle } = useArticleModal();
  const { token } = theme.useToken();
  const { t } = useTranslation();

  const page = useMemo(() => {
    const matches = matchRoutes(routes, location) ?? [];

    return matches[matches.length - 1]?.route.path ?? null;
  }, [routes, location]);

  const permissions: string[] = useAppSelector(
    (state: any) => state.user.account.permissions ?? NO_PERMISSIONS,
  );
  const canRead = permissions.includes(Permission.READ_BASIC_FEATURES);
  const canEdit = permissions.includes(Permission.WRITE_HELP_TEXT);

  const { active, picking } = useAppSelector((state) => state.helpMode);
  const cached = useAppSelector((state) =>
    page ? state.helpMode.byPage[page] : undefined,
  );
  const editorOpen = useAppSelector(
    (state) => state.helpMode.editor.draft !== null,
  );
  const articleOpen = useAppSelector(
    (state) => state.knowledgeBase.modal.articleId !== null,
  );

  const elements = cached?.list ?? EMPTY;
  // modals opened from the help mode go over it, so it steps aside meanwhile
  const shown = active && canRead && !editorOpen && !articleOpen;

  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  // a popover only stays open on the screen, and while the layer is shown
  const [opened, setOpened] = useState<{ key: string; page: string | null }>();
  const openKey = shown && opened && opened.page === page ? opened.key : null;
  const setOpenKey = useCallback(
    (key: string | null) => setOpened(key ? { key, page } : undefined),
    [page],
  );
  // a highlight stepped aside so its element can be used, until the pointer
  // leaves the element
  const [stepAside, setStepAside] = useState<{
    key: string;
    page: string | null;
  }>();
  const asideKey =
    shown && stepAside && stepAside.page === page ? stepAside.key : null;
  // "Use the element" sits in the popover, off the element: the highlight
  // only comes back once the pointer has been over the element and left it
  const asideEntered = useRef(false);
  const { matched, unmatched } = useHelpTargets(elements, shown);

  useEffect(() => {
    dispatch(setHelpModePage(page));
  }, [dispatch, page]);

  // only while the help mode is on: once per screen, and again after a save
  // empties the cache
  useEffect(() => {
    if (active && canRead && page && !cached) {
      dispatch(fetchHelpElements(page));
    }
  }, [dispatch, active, canRead, page, cached]);

  // the highlight moves with the page, its popover would not
  useEffect(() => {
    if (!openKey) return undefined;

    const close = (event: Event) => {
      if (!isInsideHelpLayer(event.target as Node)) setOpenKey(null);
    };
    window.addEventListener("scroll", close, { capture: true, passive: true });

    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [openKey, setOpenKey]);

  useEffect(() => {
    if (!asideKey) return undefined;

    const target = matched.find(({ item }) => elementKey(item) === asideKey);
    // a little slack around the element
    const margin = 8;

    const onMove = (event: MouseEvent) => {
      const rect = target?.node.getBoundingClientRect();
      const inside =
        !!rect &&
        event.clientX >= rect.left - margin &&
        event.clientX <= rect.right + margin &&
        event.clientY >= rect.top - margin &&
        event.clientY <= rect.bottom + margin;

      if (inside) {
        asideEntered.current = true;
      } else if (asideEntered.current) {
        setStepAside(undefined);
      }
    };
    // mousemove too: after the element opened a new tab, coming back to
    // this one may bring mouse events without pointer ones
    window.addEventListener("pointermove", onMove, true);
    window.addEventListener("mousemove", onMove, true);

    return () => {
      window.removeEventListener("pointermove", onMove, true);
      window.removeEventListener("mousemove", onMove, true);
    };
  }, [asideKey, matched]);

  // nor does it stay aside forever when the pointer never gets there
  useEffect(() => {
    if (!asideKey) return undefined;

    const timer = window.setTimeout(() => {
      if (!asideEntered.current) setStepAside(undefined);
    }, ASIDE_TIMEOUT);

    return () => window.clearTimeout(timer);
  }, [asideKey]);

  useEffect(() => {
    if (!shown) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (picking) {
          dispatch(setHelpModePicking(false));
        } else if (openKey) {
          setOpenKey(null);
        } else {
          dispatch(setHelpModeActive(false));
        }
        return;
      }

      // the keyboard must not trigger a highlighted element either
      const target = event.target as Node;
      if (
        (event.key === "Enter" || event.key === " ") &&
        !isInsideHelpLayer(target) &&
        matched.some(
          ({ item, node }) =>
            elementKey(item) !== asideKey && node.contains(target),
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);

    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [dispatch, shown, picking, openKey, setOpenKey, matched, asideKey]);

  const edit = useCallback(
    (item: IHelpElement) => {
      setOpenKey(null);
      dispatch(
        openHelpElementEditor({
          page: item.page,
          selector: item.selector,
          label: item.label,
          articleIds: item.articles.map((article) => article.id),
          fragile: isFragileSelector(item.selector),
          existing: true,
        }),
      );
    },
    [dispatch, setOpenKey],
  );

  // unpins one article; the element goes away with its last one
  const removeArticle = (item: IHelpElement, id: number) => {
    const articleIds = item.articles
      .map((article) => article.id)
      .filter((articleId) => articleId !== id);

    dispatch(
      saveHelpElement({
        page: item.page,
        selector: item.selector,
        label: item.label,
        articleIds,
      }),
    ).then((response: any) => {
      notification[response.error ? "error" : "success"]({
        message: response.error
          ? t("helpMode.editor.saveError")
          : t("helpMode.editor.removeArticleSuccess"),
      });
    });
  };

  const pick = (picked: IPickedElement) => {
    const existing = elements.find((item) => item.selector === picked.selector);

    if (existing) {
      edit(existing);
      return;
    }

    dispatch(
      openHelpElementEditor({
        page: page ?? GLOBAL_PAGE,
        selector: picked.selector,
        label: null,
        articleIds: [],
        fragile: picked.fragile,
        existing: false,
      }),
    );
  };

  return (
    <>
      {canEdit && <HelpElementEditor page={page} />}

      {shown &&
        createPortal(
          <LayerRoot
            id={HELP_LAYER_ID}
            ref={setContainer}
            // portaled out of the app's root, which sets the font
            style={{ fontFamily: token.fontFamily }}
          >
            {matched.map(({ item, rect }) => {
              const key = elementKey(item);

              return (
                <HelpModeHighlight
                  key={key}
                  item={item}
                  rect={rect}
                  open={openKey === key && !picking}
                  aside={asideKey === key}
                  canEdit={canEdit}
                  container={container}
                  onOpenChange={(open) => setOpenKey(open ? key : null)}
                  onOpenArticle={(id) => {
                    setOpenKey(null);
                    openArticle(id);
                  }}
                  onRemoveArticle={(id) => removeArticle(item, id)}
                  onUseElement={() => {
                    asideEntered.current = false;
                    setOpenKey(null);
                    setStepAside({ key, page });
                  }}
                  onEdit={() => edit(item)}
                />
              );
            })}

            {picking && canEdit && <HelpModePicker onPick={pick} />}

            <HelpModeBar
              picking={picking && canEdit}
              canEdit={canEdit}
              visibleCount={matched.length}
              hidden={unmatched}
              container={container}
              onPick={(value) => dispatch(setHelpModePicking(value))}
              onEdit={edit}
              onExit={() => dispatch(setHelpModeActive(false))}
            />
          </LayerRoot>,
          document.body,
        )}
    </>
  );
}
