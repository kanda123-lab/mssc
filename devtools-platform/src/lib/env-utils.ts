import { 
  EnvVariable, 
  EnvEnvironment, 
  ValidationResult, 
  SecurityPattern, 
  ExportFormat,
  ValidationRule,
  SecurityIssue,
  ValidationError,
  ValidationWarning,
  EnvComparison,
  FormatExportResult
} from '@/types';

// Security Patterns for detecting sensitive data
export const SECURITY_PATTERNS: SecurityPattern[] = [
  {
    id: 'aws-access-key',
    name: 'AWS Access Key',
    pattern: new RegExp('AKIA[0-9A-Z]{16}'),
    severity: 'critical',
    message: 'Potential AWS Access Key detected',
    suggestion: 'Use AWS IAM roles or environment-specific secrets management',
    category: 'api_key'
  },
  {
    id: 'aws-secret-key',
    name: 'AWS Secret Key',
    pattern: new RegExp('[0-9a-zA-Z/+]{40}'),
    severity: 'critical',
    message: 'Potential AWS Secret Key detected',
    suggestion: 'Use AWS Secrets Manager or environment-specific storage',
    category: 'secret'
  },
  {
    id: 'github-token',
    name: 'GitHub Token',
    pattern: new RegExp('ghp_[0-9a-zA-Z]{36}|gho_[0-9a-zA-Z]{36}|ghu_[0-9a-zA-Z]{36}|ghs_[0-9a-zA-Z]{36}|ghr_[0-9a-zA-Z]{36}'),
    severity: 'high',
    message: 'GitHub personal access token detected',
    suggestion: 'Use GitHub secrets or environment-specific token management',
    category: 'token'
  },
  {
    id: 'private-key',
    name: 'Private Key',
    pattern: new RegExp('-----BEGIN (RSA )?PRIVATE KEY-----'),
    severity: 'critical',
    message: 'Private key detected in environment variable',
    suggestion: 'Store private keys in secure key management systems',
    category: 'certificate'
  },
  {
    id: 'jwt-secret',
    name: 'JWT Secret',
    pattern: new RegExp('^[A-Za-z0-9+/]{32,}={0,2}$'),
    severity: 'high',
    message: 'Potential JWT secret detected',
    suggestion: 'Use strong, randomly generated secrets stored securely',
    category: 'secret'
  },
  {
    id: 'database-url',
    name: 'Database URL with Credentials',
    pattern: new RegExp('(mongodb|mysql|postgresql|postgres)://[^:]+:[^@]+@'),
    severity: 'high',
    message: 'Database connection string with embedded credentials',
    suggestion: 'Use connection strings without embedded passwords',
    category: 'database_url'
  },
  {
    id: 'api-key-pattern',
    name: 'Generic API Key',
    pattern: new RegExp('[a-zA-Z0-9]{32,}'),
    severity: 'medium',
    message: 'Potential API key pattern detected',
    suggestion: 'Verify if this is sensitive data and store appropriately',
    category: 'api_key'
  }
];

// Export Formats
export const EXPORT_FORMATS: ExportFormat[] = [
  {
    id: '.env',
    name: '.env File',
    extension: 'env',
    mimeType: 'text/plain',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: false
  },
  {
    id: 'json',
    name: 'JSON',
    extension: 'json',
    mimeType: 'application/json',
    supportsComments: false,
    supportsGrouping: true,
    supportsInheritance: false
  },
  {
    id: 'yaml',
    name: 'YAML',
    extension: 'yaml',
    mimeType: 'text/yaml',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: true
  },
  {
    id: 'docker-env',
    name: 'Docker ENV',
    extension: 'dockerfile',
    mimeType: 'text/plain',
    supportsComments: true,
    supportsGrouping: false,
    supportsInheritance: false
  },
  {
    id: 'k8s-configmap',
    name: 'Kubernetes ConfigMap',
    extension: 'yaml',
    mimeType: 'text/yaml',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: false
  },
  {
    id: 'k8s-secret',
    name: 'Kubernetes Secret',
    extension: 'yaml',
    mimeType: 'text/yaml',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: false
  },
  {
    id: 'terraform',
    name: 'Terraform Variables',
    extension: 'tf',
    mimeType: 'text/plain',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: false
  },
  {
    id: 'shell-export',
    name: 'Shell Export',
    extension: 'sh',
    mimeType: 'text/plain',
    supportsComments: true,
    supportsGrouping: true,
    supportsInheritance: false
  }
];

// Validation Functions
export function validateEnvironment(
  environment: EnvEnvironment, 
  securityPatterns: SecurityPattern[] = SECURITY_PATTERNS
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const securityIssues: SecurityIssue[] = [];
  const suggestions: string[] = [];

  // Validate each variable
  environment.variables.forEach(variable => {
    // Check for empty required variables
    if (variable.required && (!variable.value || variable.value.trim() === '')) {
      errors.push({
        field: variable.key,
        message: 'Required variable cannot be empty',
        rule: 'required',
        severity: 'error'
      });
    }

    // Validate naming conventions
    if (!/^[A-Z][A-Z0-9_]*$/.test(variable.key)) {
      warnings.push({
        field: variable.key,
        message: 'Variable name should follow UPPER_SNAKE_CASE convention',
        suggestion: 'Use only uppercase letters, numbers, and underscores',
        severity: 'warning'
      });
    }

    // Check for duplicates (case insensitive)
    const duplicates = environment.variables.filter(
      v => v.key.toLowerCase() === variable.key.toLowerCase() && v.id !== variable.id
    );
    if (duplicates.length > 0) {
      errors.push({
        field: variable.key,
        message: 'Duplicate variable name detected',
        rule: 'unique',
        severity: 'error'
      });
    }

    // Data type validation
    validateDataType(variable, errors, warnings);

    // Custom validation rules
    if (variable.validationRules) {
      validateCustomRules(variable, errors, warnings);
    }

    // Security pattern detection
    securityPatterns.forEach(pattern => {
      if (pattern.pattern.test(variable.value)) {
        securityIssues.push({
          field: variable.key,
          pattern: pattern.name,
          severity: pattern.severity,
          message: pattern.message,
          suggestion: pattern.suggestion,
          category: pattern.category
        });
      }
    });

    // Check for sensitive data in non-sensitive variables
    if (!variable.sensitive && isSensitiveKey(variable.key)) {
      warnings.push({
        field: variable.key,
        message: 'Variable appears to contain sensitive data but is not marked as sensitive',
        suggestion: 'Mark this variable as sensitive to enable proper masking',
        severity: 'warning'
      });
    }
  });

  // Environment-level validation
  if (environment.variables.length === 0) {
    warnings.push({
      field: 'environment',
      message: 'Environment has no variables defined',
      suggestion: 'Add variables or consider removing this environment',
      severity: 'warning'
    });
  }

  // Generate suggestions
  if (securityIssues.length > 0) {
    suggestions.push('Consider using a secrets management service for sensitive data');
  }

  if (warnings.some(w => w.message.includes('naming convention'))) {
    suggestions.push('Follow consistent naming conventions for better maintainability');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    securityIssues,
    suggestions
  };
}

function validateDataType(variable: EnvVariable, errors: ValidationError[], warnings: ValidationWarning[]) {
  const { value, dataType, key } = variable;

  if (!value) return;

  switch (dataType) {
    case 'number':
      if (isNaN(Number(value))) {
        errors.push({
          field: key,
          message: 'Value must be a valid number',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;

    case 'boolean':
      if (!['true', 'false', '1', '0', 'yes', 'no'].includes(value.toLowerCase())) {
        errors.push({
          field: key,
          message: 'Value must be a valid boolean (true/false, 1/0, yes/no)',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch {
        errors.push({
          field: key,
          message: 'Value must be a valid URL',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;

    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push({
          field: key,
          message: 'Value must be a valid email address',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;

    case 'json':
      try {
        JSON.parse(value);
      } catch {
        errors.push({
          field: key,
          message: 'Value must be valid JSON',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;

    case 'base64':
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(value)) {
        errors.push({
          field: key,
          message: 'Value must be valid base64',
          rule: 'dataType',
          severity: 'error'
        });
      }
      break;
  }
}

function validateCustomRules(variable: EnvVariable, errors: ValidationError[], warnings: ValidationWarning[]) {
  variable.validationRules?.forEach(rule => {
    const { value, key } = variable;

    switch (rule.type) {
      case 'regex':
        if (rule.pattern && !new RegExp(rule.pattern).test(value)) {
          errors.push({
            field: key,
            message: rule.errorMessage || 'Value does not match required pattern',
            rule: 'regex',
            severity: 'error'
          });
        }
        break;

      case 'length':
        if (rule.minLength && value.length < rule.minLength) {
          errors.push({
            field: key,
            message: `Value must be at least ${rule.minLength} characters long`,
            rule: 'minLength',
            severity: 'error'
          });
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push({
            field: key,
            message: `Value must be no more than ${rule.maxLength} characters long`,
            rule: 'maxLength',
            severity: 'error'
          });
        }
        break;

      case 'range':
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          if (rule.min !== undefined && numValue < rule.min) {
            errors.push({
              field: key,
              message: `Value must be at least ${rule.min}`,
              rule: 'min',
              severity: 'error'
            });
          }
          if (rule.max !== undefined && numValue > rule.max) {
            errors.push({
              field: key,
              message: `Value must be no more than ${rule.max}`,
              rule: 'max',
              severity: 'error'
            });
          }
        }
        break;

      case 'enum':
        if (rule.allowedValues && !rule.allowedValues.includes(value)) {
          errors.push({
            field: key,
            message: `Value must be one of: ${rule.allowedValues.join(', ')}`,
            rule: 'enum',
            severity: 'error'
          });
        }
        break;
    }
  });
}

function isSensitiveKey(key: string): boolean {
  const sensitivePatterns = [
    'password', 'secret', 'key', 'token', 'auth', 'private', 'credential',
    'api_key', 'jwt', 'session', 'cookie', 'oauth', 'client_secret'
  ];
  
  return sensitivePatterns.some(pattern => 
    key.toLowerCase().includes(pattern)
  );
}

// Format Generation Functions
export function generateFormatContent(environment: EnvEnvironment, format: ExportFormat): string {
  switch (format.id) {
    case '.env':
      return generateDotEnvContent(environment);
    case 'json':
      return generateJsonContent(environment);
    case 'yaml':
      return generateYamlContent(environment);
    case 'docker-env':
      return generateDockerEnvContent(environment);
    case 'k8s-configmap':
      return generateKubernetesConfigMapContent(environment);
    case 'k8s-secret':
      return generateKubernetesSecretContent(environment);
    case 'terraform':
      return generateTerraformContent(environment);
    case 'shell-export':
      return generateShellExportContent(environment);
    default:
      throw new Error(`Unsupported format: ${format.id}`);
  }
}

function generateDotEnvContent(environment: EnvEnvironment): string {
  const groups = groupVariablesByCategory(environment.variables);
  let content = '';

  // Add header comment
  content += `# Environment: ${environment.displayName}\n`;
  content += `# Generated: ${new Date().toISOString()}\n`;
  if (environment.description) {
    content += `# Description: ${environment.description}\n`;
  }
  content += '\n';

  // Generate variables by category
  Object.entries(groups).forEach(([category, variables]) => {
    if (category !== 'general') {
      content += `# ${category.charAt(0).toUpperCase() + category.slice(1)} Variables\n`;
    }

    variables.forEach(variable => {
      if (variable.description) {
        content += `# ${variable.description}\n`;
      }
      if (variable.example && variable.value === variable.defaultValue) {
        content += `# Example: ${variable.key}=${variable.example}\n`;
      }
      
      const value = variable.sensitive ? '***HIDDEN***' : variable.value;
      content += `${variable.key}=${value}\n`;
    });

    content += '\n';
  });

  return content.trim();
}

function generateJsonContent(environment: EnvEnvironment): string {
  const config: any = {
    environment: environment.name,
    displayName: environment.displayName,
    description: environment.description,
    variables: {}
  };

  environment.variables.forEach(variable => {
    const value = variable.sensitive ? '***HIDDEN***' : variable.value;
    config.variables[variable.key] = value;
  });

  return JSON.stringify(config, null, 2);
}

function generateYamlContent(environment: EnvEnvironment): string {
  let content = `# Environment: ${environment.displayName}\n`;
  content += `# Generated: ${new Date().toISOString()}\n\n`;
  
  content += `environment: ${environment.name}\n`;
  content += `displayName: "${environment.displayName}"\n`;
  
  if (environment.description) {
    content += `description: "${environment.description}"\n`;
  }
  
  content += '\nvariables:\n';

  const groups = groupVariablesByCategory(environment.variables);
  Object.entries(groups).forEach(([category, variables]) => {
    content += `  # ${category}\n`;
    variables.forEach(variable => {
      const value = variable.sensitive ? '***HIDDEN***' : variable.value;
      if (variable.description) {
        content += `  # ${variable.description}\n`;
      }
      content += `  ${variable.key}: "${value}"\n`;
    });
    content += '\n';
  });

  return content;
}

function generateDockerEnvContent(environment: EnvEnvironment): string {
  let content = `# Docker Environment Variables\n`;
  content += `# Environment: ${environment.displayName}\n\n`;

  environment.variables.forEach(variable => {
    const value = variable.sensitive ? '***HIDDEN***' : variable.value;
    content += `ENV ${variable.key}="${value}"\n`;
  });

  return content;
}

function generateKubernetesConfigMapContent(environment: EnvEnvironment): string {
  const nonSensitiveVars = environment.variables.filter(v => !v.sensitive);
  
  let content = `apiVersion: v1\n`;
  content += `kind: ConfigMap\n`;
  content += `metadata:\n`;
  content += `  name: ${environment.name}-config\n`;
  content += `  namespace: default\n`;
  content += `data:\n`;

  nonSensitiveVars.forEach(variable => {
    content += `  ${variable.key}: "${variable.value}"\n`;
  });

  return content;
}

function generateKubernetesSecretContent(environment: EnvEnvironment): string {
  const sensitiveVars = environment.variables.filter(v => v.sensitive);
  
  let content = `apiVersion: v1\n`;
  content += `kind: Secret\n`;
  content += `metadata:\n`;
  content += `  name: ${environment.name}-secret\n`;
  content += `  namespace: default\n`;
  content += `type: Opaque\n`;
  content += `stringData:\n`;

  sensitiveVars.forEach(variable => {
    content += `  ${variable.key}: "${variable.value}"\n`;
  });

  return content;
}

function generateTerraformContent(environment: EnvEnvironment): string {
  let content = `# Terraform Variables\n`;
  content += `# Environment: ${environment.displayName}\n\n`;

  environment.variables.forEach(variable => {
    content += `variable "${variable.key.toLowerCase()}" {\n`;
    content += `  type        = string\n`;
    if (variable.description) {
      content += `  description = "${variable.description}"\n`;
    }
    if (variable.defaultValue) {
      content += `  default     = "${variable.defaultValue}"\n`;
    }
    if (variable.sensitive) {
      content += `  sensitive   = true\n`;
    }
    content += `}\n\n`;
  });

  return content;
}

function generateShellExportContent(environment: EnvEnvironment): string {
  let content = `#!/bin/bash\n`;
  content += `# Environment Variables Export Script\n`;
  content += `# Environment: ${environment.displayName}\n\n`;

  environment.variables.forEach(variable => {
    const value = variable.sensitive ? '***HIDDEN***' : variable.value;
    content += `export ${variable.key}="${value}"\n`;
  });

  content += `\necho "Environment variables loaded for ${environment.displayName}"\n`;

  return content;
}

function groupVariablesByCategory(variables: EnvVariable[]): Record<string, EnvVariable[]> {
  return variables.reduce((groups, variable) => {
    const category = variable.category || 'general';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(variable);
    return groups;
  }, {} as Record<string, EnvVariable[]>);
}

// Environment Comparison
export function compareEnvironments(env1: EnvEnvironment, env2: EnvEnvironment): EnvComparison {
  const vars1Map = new Map(env1.variables.map(v => [v.key, v]));
  const vars2Map = new Map(env2.variables.map(v => [v.key, v]));

  const allKeys = new Set([...vars1Map.keys(), ...vars2Map.keys()]);
  
  const added: EnvVariable[] = [];
  const removed: EnvVariable[] = [];
  const modified: any[] = [];
  const unchanged: EnvVariable[] = [];

  allKeys.forEach(key => {
    const var1 = vars1Map.get(key);
    const var2 = vars2Map.get(key);

    if (!var1 && var2) {
      added.push(var2);
    } else if (var1 && !var2) {
      removed.push(var1);
    } else if (var1 && var2) {
      const changes = [];
      
      if (var1.value !== var2.value) {
        changes.push({ field: 'value', oldValue: var1.value, newValue: var2.value });
      }
      if (var1.description !== var2.description) {
        changes.push({ field: 'description', oldValue: var1.description || '', newValue: var2.description || '' });
      }
      if (var1.category !== var2.category) {
        changes.push({ field: 'category', oldValue: var1.category || '', newValue: var2.category || '' });
      }
      if (var1.dataType !== var2.dataType) {
        changes.push({ field: 'dataType', oldValue: var1.dataType, newValue: var2.dataType });
      }

      if (changes.length > 0) {
        changes.forEach(change => {
          modified.push({
            key,
            ...change
          });
        });
      } else {
        unchanged.push(var2);
      }
    }
  });

  return {
    environment1: env1.name,
    environment2: env2.name,
    added,
    removed,
    modified,
    unchanged
  };
}

// Variable Substitution
export function performVariableSubstitution(variables: EnvVariable[]): string {
  const varsMap = new Map(variables.map(v => [v.key, v.value]));
  let preview = '';

  variables.forEach(variable => {
    let value = variable.value;
    
    // Replace ${VAR_NAME} patterns
    value = value.replace(/\$\{([A-Z_][A-Z0-9_]*)\}/g, (match, varName) => {
      const referencedValue = varsMap.get(varName);
      return referencedValue !== undefined ? referencedValue : match;
    });

    // Replace $VAR_NAME patterns
    value = value.replace(/\$([A-Z_][A-Z0-9_]*)/g, (match, varName) => {
      const referencedValue = varsMap.get(varName);
      return referencedValue !== undefined ? referencedValue : match;
    });

    preview += `${variable.key}=${value}\n`;
  });

  return preview;
}

// Utility Functions
export function downloadContent(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseEnvFile(content: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  content.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      return;
    }

    // Find the first = sign
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, equalIndex).trim();
    let value = trimmedLine.slice(equalIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (key) {
      variables[key] = value;
    }
  });

  return variables;
}