import {
  CommandRuntimeError,
  isCommandRuntimeError,
  toCommandRuntimeError,
} from './command-error';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function parseHttpStatus(message: string): number | undefined {
  const match =
    message.match(/\b([1-5]\d{2})\s*Error\b/i) ??
    message.match(/\bstatus(?: code)?\s*[:=]?\s*([1-5]\d{2})\b/i);
  if (!match) {
    return undefined;
  }

  return Number(match[1]);
}

function classifyApiStatusError(
  status: number,
  message: string,
  error: unknown
): CommandRuntimeError | undefined {
  if (status === 401 || status === 403) {
    return new CommandRuntimeError({
      code: 'AUTH_REQUIRED',
      message: 'Authentication failed while calling Tavily.',
      suggestion: 'Run `tavily login` or pass --api-key before retrying.',
      cause: error,
      details: message,
    });
  }

  if (status === 429) {
    return new CommandRuntimeError({
      code: 'RATE_LIMITED',
      message: 'Tavily API rate limit reached.',
      suggestion: 'Wait and retry, or reduce request volume.',
      cause: error,
      details: message,
    });
  }

  if (status >= 500) {
    return new CommandRuntimeError({
      code: 'API_ERROR',
      message: 'Tavily API is unavailable or returned a server error.',
      suggestion:
        'Retry shortly. If the issue persists, check Tavily service status.',
      cause: error,
      details: message,
    });
  }

  if (status >= 400) {
    return new CommandRuntimeError({
      code: 'API_ERROR',
      message: 'Tavily API rejected the request.',
      suggestion: 'Review command options and retry.',
      cause: error,
      details: message,
    });
  }

  return undefined;
}

export function classifyCommandError(error: unknown): CommandRuntimeError {
  if (isCommandRuntimeError(error)) {
    return error;
  }

  const message = getErrorMessage(error).trim();
  const status = parseHttpStatus(message);
  if (status !== undefined) {
    const classified = classifyApiStatusError(status, message, error);
    if (classified) {
      return classified;
    }
  }

  if (/request timed out|econnaborted|timeout/i.test(message)) {
    return new CommandRuntimeError({
      code: 'API_TIMEOUT',
      message: 'Tavily request timed out.',
      suggestion:
        'Retry the command or increase timeout flags for the request.',
      cause: error,
      details: message,
    });
  }

  if (
    /unauthorized|forbidden|invalid api key|authentication|not authenticated/i.test(
      message
    )
  ) {
    return new CommandRuntimeError({
      code: 'AUTH_REQUIRED',
      message: 'Authentication failed while calling Tavily.',
      suggestion: 'Run `tavily login` or pass --api-key before retrying.',
      cause: error,
      details: message,
    });
  }

  if (
    /too many requests|rate limit/i.test(message)
  ) {
    return new CommandRuntimeError({
      code: 'RATE_LIMITED',
      message: 'Tavily API rate limit reached.',
      suggestion: 'Wait and retry, or reduce request volume.',
      cause: error,
      details: message,
    });
  }

  if (
    /econnrefused|enotfound|eai_again|econnreset|socket hang up|network error|getaddrinfo|fetch failed|an unexpected error occurred while making the request/i.test(
      message
    )
  ) {
    return new CommandRuntimeError({
      code: 'NETWORK_ERROR',
      message: 'Network failure while contacting Tavily.',
      suggestion: 'Check internet access and configured Tavily API URL.',
      cause: error,
      details: message,
    });
  }

  return toCommandRuntimeError(error, {
    code: 'COMMAND_EXECUTION_FAILED',
    message: 'Command execution failed.',
    exitCode: 1,
    suggestion: 'Retry the command. If it persists, run `tavily doctor`.',
    details: message || 'Unknown error',
  });
}
