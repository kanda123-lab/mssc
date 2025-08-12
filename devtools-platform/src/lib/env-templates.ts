import { EnvTemplate } from '@/types';

export const ENVIRONMENT_TEMPLATES: EnvTemplate[] = [
  {
    id: 'nodejs-basic',
    name: 'Node.js Basic',
    description: 'Essential environment variables for Node.js applications',
    category: 'Backend',
    framework: 'nodejs',
    variables: [
      {
        key: 'NODE_ENV',
        value: 'development',
        dataType: 'string',
        required: true,
        category: 'application',
        description: 'Node.js environment mode',
        example: 'development',
        defaultValue: 'development',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'node-env-enum',
          type: 'enum',
          allowedValues: ['development', 'production', 'staging', 'test'],
          errorMessage: 'NODE_ENV must be one of: development, production, staging, test'
        }]
      },
      {
        key: 'PORT',
        value: '3000',
        dataType: 'number',
        required: true,
        category: 'server',
        description: 'Server port number',
        example: '3000',
        defaultValue: '3000',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'port-range',
          type: 'range',
          min: 1024,
          max: 65535,
          errorMessage: 'Port must be between 1024 and 65535'
        }]
      },
      {
        key: 'LOG_LEVEL',
        value: 'info',
        dataType: 'string',
        category: 'logging',
        description: 'Application logging level',
        example: 'debug',
        defaultValue: 'info',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'log-level-enum',
          type: 'enum',
          allowedValues: ['error', 'warn', 'info', 'debug', 'trace'],
          errorMessage: 'LOG_LEVEL must be one of: error, warn, info, debug, trace'
        }]
      }
    ],
    documentation: `
# Node.js Basic Environment

This template provides the essential environment variables for a basic Node.js application.

## Variables

- **NODE_ENV**: Determines the environment mode (development, production, staging, test)
- **PORT**: The port number on which the server will listen
- **LOG_LEVEL**: Controls the verbosity of application logging

## Usage

1. Copy these variables to your .env file
2. Adjust the values according to your environment
3. Restart your Node.js application
    `,
    setupInstructions: [
      'Copy the template variables to your .env file',
      'Set NODE_ENV to your target environment',
      'Choose an available port number',
      'Configure logging level based on your needs',
      'Restart your Node.js application'
    ],
    tags: ['nodejs', 'backend', 'basic', 'server']
  },
  
  {
    id: 'nodejs-database',
    name: 'Node.js with Database',
    description: 'Node.js application with database connectivity',
    category: 'Backend',
    framework: 'nodejs',
    variables: [
      {
        key: 'DATABASE_URL',
        value: 'postgresql://username:password@localhost:5432/myapp',
        dataType: 'url',
        required: true,
        sensitive: true,
        category: 'database',
        description: 'Database connection URL',
        example: 'postgresql://user:pass@localhost:5432/dbname',
        lastUpdated: Date.now()
      },
      {
        key: 'DATABASE_POOL_MIN',
        value: '2',
        dataType: 'number',
        category: 'database',
        description: 'Minimum database connection pool size',
        example: '2',
        defaultValue: '2',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'pool-min-range',
          type: 'range',
          min: 1,
          max: 100,
          errorMessage: 'Database pool minimum must be between 1 and 100'
        }]
      },
      {
        key: 'DATABASE_POOL_MAX',
        value: '10',
        dataType: 'number',
        category: 'database',
        description: 'Maximum database connection pool size',
        example: '10',
        defaultValue: '10',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'pool-max-range',
          type: 'range',
          min: 1,
          max: 100,
          errorMessage: 'Database pool maximum must be between 1 and 100'
        }]
      },
      {
        key: 'REDIS_URL',
        value: 'redis://localhost:6379',
        dataType: 'url',
        category: 'caching',
        description: 'Redis connection URL for caching',
        example: 'redis://localhost:6379',
        lastUpdated: Date.now()
      }
    ],
    tags: ['nodejs', 'database', 'postgresql', 'redis', 'backend']
  },

  {
    id: 'react-app',
    name: 'React Application',
    description: 'Client-side React application environment variables',
    category: 'Frontend',
    framework: 'react',
    variables: [
      {
        key: 'REACT_APP_API_URL',
        value: 'http://localhost:3001/api',
        dataType: 'url',
        required: true,
        category: 'api',
        description: 'Backend API base URL',
        example: 'https://api.example.com',
        lastUpdated: Date.now()
      },
      {
        key: 'REACT_APP_ENVIRONMENT',
        value: 'development',
        dataType: 'string',
        required: true,
        category: 'application',
        description: 'Application environment',
        example: 'production',
        defaultValue: 'development',
        lastUpdated: Date.now()
      },
      {
        key: 'REACT_APP_ANALYTICS_ID',
        value: '',
        dataType: 'string',
        category: 'analytics',
        description: 'Google Analytics tracking ID',
        example: 'GA-XXXXXXXXX-X',
        lastUpdated: Date.now()
      },
      {
        key: 'REACT_APP_SENTRY_DSN',
        value: '',
        dataType: 'url',
        category: 'monitoring',
        sensitive: true,
        description: 'Sentry error tracking DSN',
        example: 'https://xxx@xxx.ingest.sentry.io/xxx',
        lastUpdated: Date.now()
      }
    ],
    tags: ['react', 'frontend', 'client', 'spa']
  },

  {
    id: 'nextjs-full',
    name: 'Next.js Full Stack',
    description: 'Complete Next.js application with API routes',
    category: 'Full Stack',
    framework: 'nextjs',
    variables: [
      {
        key: 'NEXTAUTH_SECRET',
        value: '',
        dataType: 'string',
        required: true,
        sensitive: true,
        category: 'authentication',
        description: 'NextAuth.js secret for JWT encryption',
        example: 'random-secret-string-32-chars-min',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'nextauth-secret-length',
          type: 'length',
          minLength: 32,
          errorMessage: 'NEXTAUTH_SECRET must be at least 32 characters long'
        }]
      },
      {
        key: 'NEXTAUTH_URL',
        value: 'http://localhost:3000',
        dataType: 'url',
        required: true,
        category: 'authentication',
        description: 'NextAuth.js canonical URL',
        example: 'https://example.com',
        defaultValue: 'http://localhost:3000',
        lastUpdated: Date.now()
      },
      {
        key: 'DATABASE_URL',
        value: '',
        dataType: 'url',
        required: true,
        sensitive: true,
        category: 'database',
        description: 'Database connection string',
        example: 'postgresql://user:pass@localhost:5432/db',
        lastUpdated: Date.now()
      },
      {
        key: 'GOOGLE_CLIENT_ID',
        value: '',
        dataType: 'string',
        category: 'oauth',
        description: 'Google OAuth client ID',
        example: 'xxx.apps.googleusercontent.com',
        lastUpdated: Date.now()
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        value: '',
        dataType: 'string',
        sensitive: true,
        category: 'oauth',
        description: 'Google OAuth client secret',
        lastUpdated: Date.now()
      }
    ],
    tags: ['nextjs', 'fullstack', 'authentication', 'oauth', 'database']
  },

  {
    id: 'docker-compose',
    name: 'Docker Compose',
    description: 'Environment variables for Docker containerized applications',
    category: 'DevOps',
    framework: 'docker',
    variables: [
      {
        key: 'COMPOSE_PROJECT_NAME',
        value: 'myapp',
        dataType: 'string',
        category: 'docker',
        description: 'Docker Compose project name',
        example: 'myapp',
        lastUpdated: Date.now()
      },
      {
        key: 'POSTGRES_DB',
        value: 'myapp',
        dataType: 'string',
        required: true,
        category: 'database',
        description: 'PostgreSQL database name',
        example: 'myapp',
        lastUpdated: Date.now()
      },
      {
        key: 'POSTGRES_USER',
        value: 'postgres',
        dataType: 'string',
        required: true,
        category: 'database',
        description: 'PostgreSQL username',
        example: 'postgres',
        defaultValue: 'postgres',
        lastUpdated: Date.now()
      },
      {
        key: 'POSTGRES_PASSWORD',
        value: '',
        dataType: 'string',
        required: true,
        sensitive: true,
        category: 'database',
        description: 'PostgreSQL password',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'postgres-password-length',
          type: 'length',
          minLength: 8,
          errorMessage: 'PostgreSQL password must be at least 8 characters long'
        }]
      },
      {
        key: 'REDIS_PASSWORD',
        value: '',
        dataType: 'string',
        sensitive: true,
        category: 'caching',
        description: 'Redis password for authentication',
        lastUpdated: Date.now()
      }
    ],
    tags: ['docker', 'compose', 'postgresql', 'redis', 'containerization']
  },

  {
    id: 'python-django',
    name: 'Django Application',
    description: 'Python Django web application environment',
    category: 'Backend',
    framework: 'python',
    variables: [
      {
        key: 'DJANGO_SECRET_KEY',
        value: '',
        dataType: 'string',
        required: true,
        sensitive: true,
        category: 'security',
        description: 'Django secret key for cryptographic signing',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'django-secret-length',
          type: 'length',
          minLength: 50,
          errorMessage: 'Django secret key must be at least 50 characters long'
        }]
      },
      {
        key: 'DJANGO_DEBUG',
        value: 'True',
        dataType: 'boolean',
        category: 'application',
        description: 'Django debug mode',
        example: 'False',
        defaultValue: 'True',
        lastUpdated: Date.now()
      },
      {
        key: 'DATABASE_URL',
        value: 'sqlite:///db.sqlite3',
        dataType: 'url',
        required: true,
        category: 'database',
        description: 'Database connection URL',
        example: 'postgresql://user:pass@localhost:5432/db',
        defaultValue: 'sqlite:///db.sqlite3',
        lastUpdated: Date.now()
      },
      {
        key: 'ALLOWED_HOSTS',
        value: 'localhost,127.0.0.1',
        dataType: 'string',
        required: true,
        category: 'security',
        description: 'Comma-separated list of allowed hosts',
        example: 'example.com,www.example.com',
        defaultValue: 'localhost,127.0.0.1',
        lastUpdated: Date.now()
      },
      {
        key: 'EMAIL_HOST',
        value: 'localhost',
        dataType: 'string',
        category: 'email',
        description: 'SMTP server hostname',
        example: 'smtp.gmail.com',
        defaultValue: 'localhost',
        lastUpdated: Date.now()
      },
      {
        key: 'EMAIL_PORT',
        value: '587',
        dataType: 'number',
        category: 'email',
        description: 'SMTP server port',
        example: '587',
        defaultValue: '587',
        lastUpdated: Date.now()
      }
    ],
    tags: ['python', 'django', 'web', 'backend', 'smtp']
  },

  {
    id: 'aws-deployment',
    name: 'AWS Deployment',
    description: 'Environment variables for AWS cloud deployment',
    category: 'Cloud',
    variables: [
      {
        key: 'AWS_REGION',
        value: 'us-east-1',
        dataType: 'string',
        required: true,
        category: 'aws',
        description: 'AWS region for resources',
        example: 'us-west-2',
        defaultValue: 'us-east-1',
        lastUpdated: Date.now()
      },
      {
        key: 'AWS_ACCESS_KEY_ID',
        value: '',
        dataType: 'string',
        required: true,
        sensitive: true,
        category: 'aws',
        description: 'AWS access key ID',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'aws-access-key-format',
          type: 'regex',
          pattern: '^AKIA[0-9A-Z]{16}$',
          errorMessage: 'AWS Access Key ID must start with AKIA followed by 16 alphanumeric characters'
        }]
      },
      {
        key: 'AWS_SECRET_ACCESS_KEY',
        value: '',
        dataType: 'string',
        required: true,
        sensitive: true,
        category: 'aws',
        description: 'AWS secret access key',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'aws-secret-key-length',
          type: 'length',
          minLength: 40,
          maxLength: 40,
          errorMessage: 'AWS Secret Access Key must be exactly 40 characters long'
        }]
      },
      {
        key: 'S3_BUCKET_NAME',
        value: '',
        dataType: 'string',
        category: 'aws',
        description: 'S3 bucket name for file storage',
        example: 'my-app-bucket',
        lastUpdated: Date.now()
      },
      {
        key: 'CLOUDFRONT_DISTRIBUTION_ID',
        value: '',
        dataType: 'string',
        category: 'aws',
        description: 'CloudFront distribution ID for CDN',
        example: 'E1234567890ABC',
        lastUpdated: Date.now()
      }
    ],
    tags: ['aws', 'cloud', 'deployment', 's3', 'cloudfront']
  },

  {
    id: 'monitoring-logging',
    name: 'Monitoring & Logging',
    description: 'Environment variables for application monitoring and logging',
    category: 'Observability',
    variables: [
      {
        key: 'SENTRY_DSN',
        value: '',
        dataType: 'url',
        sensitive: true,
        category: 'monitoring',
        description: 'Sentry error tracking DSN',
        example: 'https://xxx@xxx.ingest.sentry.io/xxx',
        lastUpdated: Date.now()
      },
      {
        key: 'SENTRY_ENVIRONMENT',
        value: 'development',
        dataType: 'string',
        category: 'monitoring',
        description: 'Sentry environment name',
        example: 'production',
        defaultValue: 'development',
        lastUpdated: Date.now()
      },
      {
        key: 'NEW_RELIC_LICENSE_KEY',
        value: '',
        dataType: 'string',
        sensitive: true,
        category: 'monitoring',
        description: 'New Relic license key for APM',
        lastUpdated: Date.now()
      },
      {
        key: 'DATADOG_API_KEY',
        value: '',
        dataType: 'string',
        sensitive: true,
        category: 'monitoring',
        description: 'Datadog API key for metrics',
        lastUpdated: Date.now()
      },
      {
        key: 'LOG_LEVEL',
        value: 'info',
        dataType: 'string',
        category: 'logging',
        description: 'Application log level',
        example: 'debug',
        defaultValue: 'info',
        lastUpdated: Date.now(),
        validationRules: [{
          id: 'log-level-enum',
          type: 'enum',
          allowedValues: ['error', 'warn', 'info', 'debug', 'trace'],
          errorMessage: 'LOG_LEVEL must be one of: error, warn, info, debug, trace'
        }]
      },
      {
        key: 'ENABLE_METRICS',
        value: 'true',
        dataType: 'boolean',
        category: 'monitoring',
        description: 'Enable application metrics collection',
        example: 'false',
        defaultValue: 'true',
        lastUpdated: Date.now()
      }
    ],
    tags: ['monitoring', 'logging', 'sentry', 'datadog', 'newrelic', 'observability']
  },

  {
    id: 'testing-environment',
    name: 'Testing Environment',
    description: 'Environment variables for testing and CI/CD',
    category: 'Testing',
    variables: [
      {
        key: 'NODE_ENV',
        value: 'test',
        dataType: 'string',
        required: true,
        category: 'application',
        description: 'Set environment to test mode',
        example: 'test',
        defaultValue: 'test',
        lastUpdated: Date.now()
      },
      {
        key: 'TEST_DATABASE_URL',
        value: 'postgresql://test:test@localhost:5432/test_db',
        dataType: 'url',
        required: true,
        category: 'database',
        description: 'Test database connection URL',
        example: 'postgresql://test:test@localhost:5432/test_db',
        lastUpdated: Date.now()
      },
      {
        key: 'JEST_TIMEOUT',
        value: '30000',
        dataType: 'number',
        category: 'testing',
        description: 'Jest test timeout in milliseconds',
        example: '60000',
        defaultValue: '30000',
        lastUpdated: Date.now()
      },
      {
        key: 'COVERAGE_THRESHOLD',
        value: '80',
        dataType: 'number',
        category: 'testing',
        description: 'Minimum code coverage threshold percentage',
        example: '90',
        defaultValue: '80',
        lastUpdated: Date.now()
      },
      {
        key: 'DISABLE_EXTERNAL_APIS',
        value: 'true',
        dataType: 'boolean',
        category: 'testing',
        description: 'Disable external API calls during testing',
        example: 'false',
        defaultValue: 'true',
        lastUpdated: Date.now()
      }
    ],
    tags: ['testing', 'jest', 'ci-cd', 'coverage', 'database']
  }
];

export function getTemplatesByCategory(category?: string): EnvTemplate[] {
  if (!category) return ENVIRONMENT_TEMPLATES;
  return ENVIRONMENT_TEMPLATES.filter(template => template.category === category);
}

export function getTemplatesByFramework(framework?: string): EnvTemplate[] {
  if (!framework) return ENVIRONMENT_TEMPLATES;
  return ENVIRONMENT_TEMPLATES.filter(template => template.framework === framework);
}

export function searchTemplates(query: string): EnvTemplate[] {
  const lowerQuery = query.toLowerCase();
  return ENVIRONMENT_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    template.variables.some(variable => 
      variable.key.toLowerCase().includes(lowerQuery) ||
      (variable.description && variable.description.toLowerCase().includes(lowerQuery))
    )
  );
}

export function getTemplateCategories(): string[] {
  return Array.from(new Set(ENVIRONMENT_TEMPLATES.map(t => t.category))).sort();
}

export function getTemplateFrameworks(): string[] {
  return Array.from(new Set(ENVIRONMENT_TEMPLATES
    .map(t => t.framework)
    .filter(f => f !== undefined)
  )).sort();
}