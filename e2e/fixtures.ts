import { test as base } from '@playwright/test';

type ConsoleEntry = {
  type: string;
  text: string;
  url: string;
  timestamp: string;
};

export const test = base.extend<{ captureConsoleLogs: void }>({
  captureConsoleLogs: [
    async ({ page }, use, testInfo) => {
      const logs: ConsoleEntry[] = [];

      page.on('console', msg => {
        const type = msg.type();
        if (type === 'error' || type === 'warning') {
          logs.push({
            type,
            text: msg.text(),
            url: msg.location().url || '',
            timestamp: new Date().toISOString(),
          });
        }
      });

      page.on('pageerror', error => {
        logs.push({
          type: 'page-error',
          text: error.message,
          url: '',
          timestamp: new Date().toISOString(),
        });
      });

      await use();

      if (logs.length > 0) {
        const logText = logs
          .map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}${l.url ? ` (${l.url})` : ''}`)
          .join('\n');

        await testInfo.attach('browser-console-logs', {
          body: logText,
          contentType: 'text/plain',
        });
      }
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
