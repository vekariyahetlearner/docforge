import React from 'react';
import { PROJECT_NAME } from '@docforge/shared';

/**
 * @docforge/web
 * Web application package boundary.
 * Full React UI components and Vite development server will be implemented in Phase 04.
 */
export const WEB_PACKAGE_NAME = '@docforge/web';

export function createWebRootElement(): React.ReactElement {
  return React.createElement('div', { id: 'app' }, `${PROJECT_NAME} Web Frontend`);
}
