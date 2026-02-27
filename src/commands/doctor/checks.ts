export type DoctorCheckCategory = 'auth' | 'api-url' | 'dependency' | 'setup';
export type DoctorCheckStatus = 'pass' | 'warn' | 'fail';

export interface DoctorCheckResult {
  id: string;
  category: DoctorCheckCategory;
  status: DoctorCheckStatus;
  required: boolean;
  message: string;
  remediation?: string;
  details?: Record<string, unknown>;
}

export interface DoctorCheckContext {
  apiKey?: string;
  apiUrl?: string;
}

export interface DoctorCheck {
  id: string;
  category: DoctorCheckCategory;
  required: boolean;
  run: (context: DoctorCheckContext) => Promise<Omit<DoctorCheckResult, 'id'>> | Omit<DoctorCheckResult, 'id'>;
}

const defaultChecks: DoctorCheck[] = [
  {
    id: 'auth.framework',
    category: 'auth',
    required: true,
    run: async () => ({
      category: 'auth',
      required: true,
      status: 'pass',
      message: 'Doctor command check framework loaded.',
    }),
  },
  {
    id: 'setup.framework',
    category: 'setup',
    required: true,
    run: async () => ({
      category: 'setup',
      required: true,
      status: 'pass',
      message: 'Doctor command report aggregation loaded.',
    }),
  },
];

export async function runDoctorChecks(
  context: DoctorCheckContext = {},
  checks: DoctorCheck[] = defaultChecks
): Promise<DoctorCheckResult[]> {
  const results = await Promise.all(
    checks.map(async (check) => {
      const result = await check.run(context);
      return {
        ...result,
        id: check.id,
      };
    })
  );

  return [...results].sort((a, b) => a.id.localeCompare(b.id));
}
