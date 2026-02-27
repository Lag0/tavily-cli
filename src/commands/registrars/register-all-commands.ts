import type { Command } from 'commander';
import {
  registerWebCommands,
  type WebCommandRegistrationOptions,
} from './register-web-commands';
import { registerAuthCommands } from './register-auth-commands';
import { registerToolingCommands } from './register-tooling-commands';

export interface RegisterAllCommandsOptions extends WebCommandRegistrationOptions {}

export function registerAllCommands(
  program: Command,
  options: RegisterAllCommandsOptions
): void {
  registerWebCommands(program, options);
  registerAuthCommands(program);
  registerToolingCommands(program);
}
