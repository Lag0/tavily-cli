import { CommandRuntimeError } from './command-error';

function getCauseMessage(cause: unknown): string | undefined {
  if (!cause) {
    return undefined;
  }

  if (cause instanceof Error) {
    return cause.message;
  }

  if (typeof cause === 'string') {
    return cause;
  }

  return undefined;
}

export function renderCliError(error: CommandRuntimeError): string {
  const lines = [`Error [${error.code}]: ${error.message}`];

  if (error.suggestion) {
    lines.push(`Remediation: ${error.suggestion}`);
  }

  if (error.details) {
    lines.push(`Details: ${error.details}`);
  }

  const causeMessage = getCauseMessage(error.cause);
  if (causeMessage && causeMessage !== error.message) {
    lines.push(`Cause: ${causeMessage}`);
  }

  return lines.join('\n');
}
