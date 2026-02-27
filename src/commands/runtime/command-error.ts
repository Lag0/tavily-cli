export type CommandErrorCode =
  | 'COMMAND_FAILED'
  | 'INVALID_INPUT'
  | 'AUTH_REQUIRED'
  | 'COMMAND_EXECUTION_FAILED';

export interface CommandRuntimeErrorOptions {
  code: CommandErrorCode;
  message: string;
  exitCode?: number;
  suggestion?: string;
  cause?: unknown;
}

export class CommandRuntimeError extends Error {
  readonly code: CommandErrorCode;
  readonly exitCode: number;
  readonly suggestion?: string;
  readonly cause?: unknown;

  constructor(options: CommandRuntimeErrorOptions) {
    super(options.message);
    this.name = 'CommandRuntimeError';
    this.code = options.code;
    this.exitCode = options.exitCode ?? 1;
    this.suggestion = options.suggestion;
    this.cause = options.cause;
  }
}

export function isCommandRuntimeError(
  error: unknown
): error is CommandRuntimeError {
  return error instanceof CommandRuntimeError;
}

export function toCommandRuntimeError(
  error: unknown,
  fallback: Omit<CommandRuntimeErrorOptions, 'cause'>
): CommandRuntimeError {
  if (isCommandRuntimeError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new CommandRuntimeError({
      ...fallback,
      message: error.message || fallback.message,
      cause: error,
    });
  }

  return new CommandRuntimeError({
    ...fallback,
    cause: error,
  });
}
