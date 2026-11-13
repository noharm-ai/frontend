import { ExclamationCircleOutlined } from "@ant-design/icons";

interface FieldErrorProps {
  // nothing shows while there is no error, or before the user tried to move on
  message?: string | false | null;
}

/**
 * What keeps a field of the review from being done, under it. The modal
 * brings the first one of the step into sight when the user tries to move on.
 */
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;

  return (
    <div
      className="review-field-error"
      role="alert"
      data-testid="review-field-error"
    >
      <ExclamationCircleOutlined aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
