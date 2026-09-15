import { PROJECT_NAME } from '@docforge/shared';
import { CONVERSION_CORE_PACKAGE_NAME } from '@docforge/conversion-core';
import { CONFIG_PACKAGE_NAME } from '@docforge/config';

/**
 * @docforge/api
 * API application package boundary.
 * HTTP routing, upload handling, and Express setup will be implemented in Phase 03.
 */
export const API_PACKAGE_NAME = '@docforge/api';

export function bootstrapApi(): { appName: string; core: string; config: string } {
  return {
    appName: `${PROJECT_NAME} API`,
    core: CONVERSION_CORE_PACKAGE_NAME,
    config: CONFIG_PACKAGE_NAME
  };
}
