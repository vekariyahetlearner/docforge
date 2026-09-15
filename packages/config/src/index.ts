/**
 * @docforge/config
 * Centralized configuration constants and metadata.
 */
export const CONFIG_PACKAGE_NAME = '@docforge/config';
export const SUPPORTED_ENVIRONMENTS = ['development', 'test', 'production'] as const;
export type SupportedEnvironment = (typeof SUPPORTED_ENVIRONMENTS)[number];
