export function getCardScanErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  const maybeError = error as {
    response?: {
      data?: {
        meta?: {
          userMessage?: string;
          systemMessage?: string;
        };
      };
    };
  };

  return (
    maybeError?.response?.data?.meta?.userMessage ||
    maybeError?.response?.data?.meta?.systemMessage ||
    "서버 오류"
  );
}

