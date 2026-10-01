import { useEffect, useRef } from "react";

import api from "services/api";
import notification from "components/notification";

const NOT_FOUND_MESSAGE = "Evolução não localizada neste atendimento.";

// notes from prescricao_evolucao share the list but not the id space
const findNote = (list, id) =>
  Object.values(list)
    .flat()
    .find((note) => note.source !== "prescription" && `${note.id}` === `${id}`);

const scrollToNote = (id) => {
  window.setTimeout(() => {
    document
      .querySelector(`.ant-modal [data-note-id="${CSS.escape(`${id}`)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 300);
};

/**
 * Selects a given clinical note (fkevolucao) in the notes list once it is
 * loaded. Only the most recent days come with the list: when the note is
 * older, its date is looked up and that day is loaded first.
 *
 * Call it after the effect that selects the first note of the list, so this
 * selection wins.
 */
export const useTargetClinicalNote = ({
  targetId,
  admissionNumber,
  list,
  dates,
  isFetching,
  isFetchingExtra,
  fetchByDate,
  select,
}) => {
  const doneRef = useRef(false);
  // undefined: not looked up yet; "pending": looking up; else the date loaded
  const lookupRef = useRef(undefined);
  // the date lookup may resolve after the modal is closed
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!targetId || doneRef.current || isFetching) return;

    const finish = (message) => {
      doneRef.current = true;
      if (message && mountedRef.current) {
        notification.info({ message });
      }
    };

    const note = findNote(list, targetId);
    if (note) {
      finish();
      select(note);
      scrollToNote(note.id);
      return;
    }

    const lookup = lookupRef.current;

    if (lookup === undefined) {
      lookupRef.current = "pending";

      api.clinicalNotes
        .getSingle({ id: targetId })
        .then((response) => {
          if (!mountedRef.current) return;

          const date = response.data?.data?.date?.substring(0, 10);

          if (!date || !dates[date]) {
            finish(NOT_FOUND_MESSAGE);
            return;
          }

          lookupRef.current = date;
          fetchByDate(admissionNumber, date);
        })
        .catch(() => finish(NOT_FOUND_MESSAGE));

      return;
    }

    // the day was loaded and the note is still not there
    if (lookup !== "pending" && !isFetchingExtra && list[lookup]?.length) {
      finish(NOT_FOUND_MESSAGE);
    }
  }, [
    targetId,
    admissionNumber,
    list,
    dates,
    isFetching,
    isFetchingExtra,
    fetchByDate,
    select,
  ]);
};
