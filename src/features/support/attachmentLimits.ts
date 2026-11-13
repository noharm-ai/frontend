import * as Yup from "yup";

type Translator = (key: string, options?: Record<string, unknown>) => string;

/** per file, as the forms always enforced (decimal megabytes) */
export const MAX_FILE_SIZE = 2_000_000;

/** files per upload field, also enforced when picking files */
export const MAX_ATTACHMENTS = 2;

/**
 * Sum of the files sent in one request.
 *
 * Tickets go through API Gateway to a synchronous Lambda, whose request
 * payload is capped at 6 MB (6,291,456 bytes) for the whole invocation event.
 * Binary bodies are base64-encoded into that event, growing them by 4/3, and
 * the multipart framing, the ticket's HTML description and the event envelope
 * (headers, request context) ride along. 3 MB of files become ~4 MB of
 * base64, leaving ~2 MB of headroom for everything else. Two files at the
 * per-file cap (4 MB raw, ~5.3 MB encoded) left almost none.
 */
export const MAX_TOTAL_ATTACHMENTS_SIZE = 3_000_000;

const toMb = (bytes: number) => bytes / 1_000_000;

const isFile = (value: unknown): value is { size: number; name: string } =>
  !!value && typeof (value as { size?: unknown }).size === "number";

/**
 * Yup schema for an antd Upload file list: each file within MAX_FILE_SIZE,
 * at most MAX_ATTACHMENTS files and MAX_TOTAL_ATTACHMENTS_SIZE overall.
 * Errors are reported on `path` so the form shows them under the field.
 */
export const attachmentListSchema = (t: Translator, path: string) =>
  Yup.array()
    .of(
      Yup.mixed()
        .nullable()
        .test("is-valid-size", function (value) {
          if (!isFile(value)) return true;

          return value.size <= MAX_FILE_SIZE
            ? true
            : this.createError({
                message: `${value.name}: ${t("validation.max2mb")}`,
                path,
              });
        }),
    )
    .test("max-attachments", function (list) {
      if (!Array.isArray(list) || list.length <= MAX_ATTACHMENTS) return true;

      return this.createError({
        message: t("validation.maxAttachments", { max: MAX_ATTACHMENTS }),
        path,
      });
    })
    .test("max-total-size", function (list) {
      if (!Array.isArray(list)) return true;

      const total = list.reduce(
        (sum: number, f: unknown) => sum + (isFile(f) ? f.size : 0),
        0,
      );

      return total <= MAX_TOTAL_ATTACHMENTS_SIZE
        ? true
        : this.createError({
            message: t("validation.maxTotalAttachmentsSize", {
              max: toMb(MAX_TOTAL_ATTACHMENTS_SIZE),
            }),
            path,
          });
    });
