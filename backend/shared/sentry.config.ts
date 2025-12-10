import * as Sentry from '@sentry/node';
import type { EventHint, ErrorEvent } from '@sentry/types';

export interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  serviceName: string;
}

/**
 * Initialize Sentry for backend services
 * @param config - Sentry configuration
 */
export const initializeSentry = (config: SentryConfig): void => {
  const { dsn, environment, release, serviceName } = config;

  // Only initialize if DSN is provided
  if (!dsn || dsn === '') {
    console.warn(`⚠️  Sentry DSN not configured for ${serviceName}. Error tracking disabled.`);
    return;
  }

  Sentry.init({
    dsn,
    environment: environment || 'development',
    release: release || undefined,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0, // 100% in dev, 10% in prod
    profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Service-specific tagging
    initialScope: {
      tags: {
        service: serviceName,
      },
    },

    // Before send hook to sanitize sensitive data
    beforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
      // Sanitize request body to remove sensitive fields
      if (event.request?.data) {
        const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'authorization'];
        const sanitized = sanitizeObject(event.request.data, sensitiveFields);
        event.request.data = sanitized;
      }

      // Sanitize user data
      if (event.user) {
        // Only keep non-sensitive user info
        event.user = {
          id: event.user.id,
          email: event.user.email,
          username: event.user.username,
        };
      }

      return event;
    },

    // Integration configuration
    integrations: [
      // Enable HTTP instrumentation (includes Express support)
      Sentry.httpIntegration(),
    ],
  });

  console.log(`✅ Sentry initialized for ${serviceName} (${environment})`);
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

/**
 * Set user context in Sentry
 */
export const setUserContext = (user: { userId?: string; id?: string; email?: string; username?: string }): void => {
  Sentry.setUser({
    id: user.userId || user.id,
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
 * Capture gRPC error with context
 */
export const captureGrpcError = (
  error: Error,
  context: {
    service: string;
    method: string;
    statusCode?: number;
    metadata?: Record<string, any>;
  }
): void => {
  Sentry.withScope((scope: Sentry.Scope) => {
    scope.setTag('grpc_service', context.service);
    scope.setTag('grpc_method', context.method);
    scope.setContext('grpc', {
      service: context.service,
      method: context.method,
      statusCode: context.statusCode,
      metadata: context.metadata,
    });
    Sentry.captureException(error);
  });
};

