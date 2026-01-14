import { useState, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { getQueueStatus } from "src/features/serverActions/ServerActionsSlice";

interface QueueResponse {
  found: boolean;
  response: {
    error?: any;
    [key: string]: any;
  };
}

interface InitialActionResponse {
  payload: {
    data: {
      data: {
        request_id: string;
      };
    };
  };
  error?: any;
}

interface UseQueueProcessOptions<T = any> {
  initialAction: (...args: any[]) => any;
  pollingInterval?: number;
  onSuccess?: (result: T) => void;
  onError?: (error: any) => void;
}

interface UseQueueProcessReturn<T = any> {
  loading: boolean;
  result: T | null;
  error: any;
  startProcess: (actionParams?: any) => Promise<void>;
  resetState: () => void;
  cleanup: () => void;
}

/**
 * Custom hook for handling async operations that require queue polling
 * @param options - Configuration options
 * @returns Hook state and controls
 */
export default function useQueueProcess<T = any>({
  initialAction,
  pollingInterval = 5000,
  onSuccess,
  onError,
}: UseQueueProcessOptions<T>): UseQueueProcessReturn<T> {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setResult(null);
    setError(null);
    clearPolling();
  }, [clearPolling]);

  const startProcess = useCallback(
    async (actionParams?: any): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        setResult(null);

        console.log("action params", actionParams);

        // Dispatch initial action to get request ID
        const initialResponse = await dispatch(initialAction(actionParams));

        if (initialResponse.error) {
          setLoading(false);
          setError(initialResponse.error);

          const errorMessage = getErrorMessage(initialResponse, t);
          notification.error({
            message: errorMessage,
          });

          if (onError) {
            onError(initialResponse.error);
          }
          return;
        }

        console.log("Initial response:", initialResponse);

        // Extract request ID from response
        const typedResponse = initialResponse as InitialActionResponse;
        const requestId = typedResponse.payload.data.data.request_id;

        if (!requestId) {
          const errorMsg = "Request ID not found in response";
          setLoading(false);
          setError(errorMsg);
          notification.error({
            message: errorMsg,
          });
          return;
        }

        console.log("Request ID:", requestId);

        // Start polling queue status
        const pollQueueStatus = async (): Promise<void> => {
          try {
            const statusResponse: any = await dispatch(
              // @ts-expect-error ts 2554 (legacy code)
              getQueueStatus({ requestId })
            );
            console.log("Queue status response:", statusResponse);

            if (statusResponse.error) {
              clearPolling();
              setLoading(false);
              setError(statusResponse.error);

              const errorMessage = getErrorMessage(statusResponse, t);
              notification.error({
                message: errorMessage,
              });

              if (onError) {
                onError(statusResponse.error);
              }
              return;
            }

            const statusData = statusResponse.payload?.data as QueueResponse;

            if (statusData.found) {
              clearPolling();
              setLoading(false);

              if (!statusData.response.error) {
                setResult(statusData.response as T);

                if (onSuccess) {
                  onSuccess(statusData.response as T);
                }
              } else {
                setError(statusData.response.error);
                console.error("Queue process failed", statusData.response);

                notification.error({
                  message:
                    "Ocorreu um erro ao processar a solicitação. Entre em contato.",
                });

                if (onError) {
                  onError(statusData.response.error);
                }
              }
            }
          } catch (err) {
            console.error("Error polling queue status:", err);
            clearPolling();
            setLoading(false);
            setError(err);

            if (onError) {
              onError(err);
            }
          }
        };

        // Start polling
        intervalRef.current = setInterval(pollQueueStatus, pollingInterval);
      } catch (err) {
        console.error("Error starting process:", err);
        setLoading(false);
        setError(err);

        if (onError) {
          onError(err);
        }
      }
    },
    [
      dispatch,
      initialAction,
      pollingInterval,
      onSuccess,
      onError,
      t,
      clearPolling,
    ]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    clearPolling();
  }, [clearPolling]);

  return {
    loading,
    result,
    error,
    startProcess,
    resetState,
    cleanup,
  };
}
