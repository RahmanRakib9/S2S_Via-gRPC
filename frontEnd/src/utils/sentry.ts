import * as Sentry from '@sentry/react';
import type { ErrorEvent, EventHint } from '@sentry/react';

/**
 * Initialize Sentry for the React frontend
 */
export const initializeSentry = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN || '';
  const environment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || 'development';
  const release = import.meta.env.VITE_SENTRY_RELEASE;

  // Only initialize if DSN is provided
  if (!dsn || dsn === '') {
    console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release: release || undefined,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 100% in dev, 10% in prod
    // Session Replay
    replaysSessionSampleRate: environment === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with an error

    // Before send hook to sanitize sensitive data
    beforeSend(event: ErrorEvent, _hint: EventHint): ErrorEvent | null {
      // Sanitize request data
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken'];
        event.request.data = sanitizeObject(event.request.data, sensitiveFields);
      }

      // Sanitize user data
      if (event.user) {
        event.user = {
          id: event.user.id,
          email: event.user.email,
          username: event.user.username,
        };
      }

      return event;
    },
  });

  console.log(`✅ Sentry initialized for frontend (${environment})`);
};

/**
 * Set user context in Sentry
 */
export const setUserContext = (user: { id?: string; email?: string; username?: string }): void => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
};

/**
 * Clear user context from Sentry
 */
export const clearUserContext = (): void => {
  Sentry.setUser(null);
};

/**
 * Capture API error with context
 */
export const captureApiError = (
  error: Error,
  context: {
    url: string;
    method: string;
    statusCode?: number;
    requestData?: any;
  }
): void => {
  Sentry.withScope((scope: Sentry.Scope) => {
    scope.setTag('api_error', 'true');
    scope.setContext('api_request', {
      url: context.url,
      method: context.method,
      statusCode: context.statusCode,
      requestData: sanitizeObject(context.requestData, ['password', 'token', 'accessToken', 'refreshToken']),
    });
    Sentry.captureException(error);
  });
};

/**
 * Sanitize object by removing sensitive fields
 */
function sanitizeObject(obj: any, sensitiveFields: string[]): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, sensitiveFields));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value, sensitiveFields);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  return obj;
}

