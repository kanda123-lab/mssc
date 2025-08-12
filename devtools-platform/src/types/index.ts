export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  category: 'api' | 'data' | 'database' | 'development';
  tags: string[];
  featured: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface APIRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

export interface WebSocketConnection {
  id: string;
  name: string;
  url: string;
  protocols: string[];
  messages: WebSocketMessage[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  timestamp: number;
}

export interface WebSocketMessage {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: number;
}

export interface MockEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  };
  delay?: number;
  enabled: boolean;
}

// Database and Analysis Tool Interfaces
export interface SQLQuery {
  id: string;
  name: string;
  query: string;
  dialect: 'mysql' | 'postgresql' | 'sqlite' | 'mssql' | 'oracle' | 'generic';
  description?: string;
  timestamp: number;
}

export interface DatabaseConnection {
  id: string;
  name: string;
  type: DatabaseType;
  connectionString: string;
  maskedConnectionString?: string;
  parameters: Record<string, string>;
  timestamp: number;
  valid?: boolean;
  testResult?: ConnectionTestResult;
  securityScore?: number;
}

export type DatabaseType = 'mysql' | 'postgresql' | 'sqlite' | 'mssql' | 'oracle' | 'mongodb' | 
  'redis' | 'cassandra' | 'elasticsearch' | 'mariadb' | 'h2' | 'hsqldb' | 'firebird' | 'informix' | 'db2';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  latencyMs: number;
  timestamp: number;
  details?: Record<string, any>;
}

export interface SecurityRecommendation {
  type: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  solution: string;
  documentation?: string;
}

export interface PerformanceRecommendation {
  category: string;
  suggestion: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  documentation?: string;
}

export interface ConnectionTemplate {
  id: string;
  name: string;
  category: 'development' | 'production' | 'cloud' | 'testing';
  databaseType: DatabaseType;
  parameters: Record<string, any>;
  description?: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  displayName: string;
  extension: string;
  mimeType: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
  description?: string;
}

export interface CloudConfig {
  provider: 'aws' | 'azure' | 'gcp' | 'heroku';
  configuration: Record<string, any>;
  instructions?: string[];
}

export type SslMode = 'disable' | 'allow' | 'prefer' | 'require' | 'verify-ca' | 'verify-full';

export interface DatabaseParameters {
  // Basic connection parameters
  host?: string;
  port?: number;
  database?: string;
  schema?: string;
  username?: string;
  password?: string;
  
  // Database-specific parameters
  serviceName?: string; // Oracle
  instanceName?: string; // SQL Server
  authSource?: string; // MongoDB
  filePath?: string; // SQLite
  
  // SSL and Security
  sslMode?: SslMode;
  sslCert?: string;
  sslKey?: string;
  sslRootCert?: string;
  verifyServerCertificate?: boolean;
  useEncryption?: boolean;
  
  // Connection Pool
  minPoolSize?: number;
  maxPoolSize?: number;
  connectionTimeout?: number;
  commandTimeout?: number;
  idleTimeout?: number;
  maxLifetime?: number;
  
  // Advanced Options
  charset?: string;
  collation?: string;
  timezone?: string;
  autoReconnect?: boolean;
  allowMultipleQueries?: boolean;
  applicationName?: string;
  workstation?: string;
  
  // NoSQL specific
  replicaSet?: string;
  readPreference?: boolean;
  readConcernLevel?: number;
  writeConcernLevel?: number;
  authMechanism?: string;
  retryWrites?: boolean;
  
  // Cassandra specific
  datacenter?: string;
  keyspace?: string;
  consistencyLevel?: number;
  
  // Additional parameters
  additionalParams?: Record<string, string>;
  
  // Index signature for dynamic access
  [key: string]: string | number | boolean | Record<string, string> | undefined;
}

// MongoDB Query Builder Interfaces
export interface MongoQuery {
  id: string;
  name: string;
  collection: string;
  operation: MongoOperation;
  pipeline?: MongoPipelineStage[];
  filter?: MongoFilter;
  document?: Record<string, any>;
  documents?: Record<string, any>[];
  update?: MongoUpdate;
  options?: MongoQueryOptions;
  description?: string;
  timestamp: number;
  generated?: {
    shell: string;
    nodejs: string;
    python: string;
    java: string;
    csharp: string;
    php: string;
  };
}

export type MongoOperation = 
  | 'find'
  | 'insertOne'
  | 'insertMany'
  | 'updateOne'
  | 'updateMany'
  | 'replaceOne'
  | 'deleteOne'
  | 'deleteMany'
  | 'aggregate'
  | 'createIndex'
  | 'dropIndex'
  | 'distinct'
  | 'count'
  | 'countDocuments'
  | 'estimatedDocumentCount';

export interface MongoPipelineStage {
  id: string;
  stage: MongoStageType;
  config: Record<string, any>;
  enabled: boolean;
  order: number;
  preview?: any[];
  error?: string;
}

export type MongoStageType = 
  | '$match'
  | '$group'
  | '$sort'
  | '$limit'
  | '$skip'
  | '$project'
  | '$unwind'
  | '$lookup'
  | '$facet'
  | '$bucket'
  | '$bucketAuto'
  | '$addFields'
  | '$replaceRoot'
  | '$replaceWith'
  | '$sample'
  | '$sortByCount'
  | '$redact'
  | '$geoNear'
  | '$indexStats'
  | '$collStats'
  | '$out'
  | '$merge'
  | '$unionWith';

export interface MongoFilter {
  conditions: MongoCondition[];
  logic: 'AND' | 'OR';
}

export interface MongoCondition {
  id: string;
  field: string;
  operator: MongoOperator;
  value: any;
  dataType: MongoDataType;
  logic?: 'AND' | 'OR';
  groupStart?: boolean;
  groupEnd?: boolean;
  not?: boolean;
}

export type MongoOperator = 
  | '$eq'
  | '$ne'
  | '$gt'
  | '$gte'
  | '$lt'
  | '$lte'
  | '$in'
  | '$nin'
  | '$exists'
  | '$type'
  | '$regex'
  | '$text'
  | '$where'
  | '$all'
  | '$elemMatch'
  | '$size'
  | '$mod'
  | '$geoWithin'
  | '$geoIntersects'
  | '$near'
  | '$nearSphere';

export type MongoDataType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'objectId'
  | 'array'
  | 'object'
  | 'null'
  | 'regex'
  | 'binary'
  | 'decimal128';

export interface MongoUpdate {
  type: 'replace' | 'update';
  operations: MongoUpdateOperation[];
}

export interface MongoUpdateOperation {
  operator: MongoUpdateOperator;
  field: string;
  value: any;
}

export type MongoUpdateOperator = 
  | '$set'
  | '$unset'
  | '$inc'
  | '$mul'
  | '$rename'
  | '$min'
  | '$max'
  | '$currentDate'
  | '$push'
  | '$addToSet'
  | '$pop'
  | '$pull'
  | '$pullAll'
  | '$each'
  | '$slice'
  | '$sort'
  | '$position';

export interface MongoQueryOptions {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 1 | 0>;
  hint?: string | Record<string, 1 | -1>;
  maxTimeMS?: number;
  readPreference?: 'primary' | 'secondary' | 'primaryPreferred' | 'secondaryPreferred' | 'nearest';
  readConcern?: 'local' | 'available' | 'majority' | 'linearizable' | 'snapshot';
  writeConcern?: {
    w?: number | string;
    j?: boolean;
    wtimeout?: number;
  };
  upsert?: boolean;
  multi?: boolean;
}

export interface MongoIndex {
  name: string;
  keys: Record<string, 1 | -1 | 'text' | '2dsphere' | '2d' | 'hashed'>;
  options?: {
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    expireAfterSeconds?: number;
    textIndexVersion?: number;
    weights?: Record<string, number>;
    default_language?: string;
    language_override?: string;
    partialFilterExpression?: Record<string, any>;
  };
}

export interface MongoSchema {
  collection: string;
  fields: MongoField[];
  sampleDocument?: Record<string, any>;
  indexes?: MongoIndex[];
  stats?: {
    documentCount: number;
    avgDocumentSize: number;
    collectionSize: number;
    storageSize: number;
  };
}

export interface MongoField {
  name: string;
  path: string;
  type: MongoDataType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  sample?: any;
  frequency?: number;
  nestedFields?: MongoField[];
}

export interface MongoTemplate {
  id: string;
  name: string;
  category: 'basic' | 'aggregation' | 'crud' | 'indexing' | 'geospatial' | 'text_search' | 'time_series';
  description: string;
  query: Partial<MongoQuery>;
  tags: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
  useCase: string;
}

export interface MongoValidationResult {
  valid: boolean;
  errors: MongoValidationError[];
  warnings: MongoValidationWarning[];
  performance?: MongoPerformanceHint[];
}

export interface MongoValidationError {
  stage?: string;
  field?: string;
  message: string;
  code?: string;
}

export interface MongoValidationWarning {
  stage?: string;
  field?: string;
  message: string;
  suggestion: string;
}

export interface MongoPerformanceHint {
  type: 'index' | 'pipeline' | 'query' | 'general';
  severity: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  documentation?: string;
}

export interface MongoGeoQuery {
  type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon' | 'GeometryCollection';
  coordinates: number[] | number[][] | number[][][];
  operator: '$geoWithin' | '$geoIntersects' | '$near' | '$nearSphere';
  options?: {
    maxDistance?: number;
    minDistance?: number;
    spherical?: boolean;
    distanceField?: string;
    geometry?: MongoGeoQuery;
  };
}

export interface MongoTextSearchQuery {
  searchTerm: string;
  language?: string;
  caseSensitive?: boolean;
  diacriticSensitive?: boolean;
  scoreField?: string;
  metaTextScore?: boolean;
}

export interface MongoTimeSeriesQuery {
  timeField: string;
  metaField?: string;
  granularity?: 'seconds' | 'minutes' | 'hours' | 'days';
  bucketMaxSpanSeconds?: number;
  bucketRoundingSeconds?: number;
  expireAfterSeconds?: number;
}

export interface MongoQueryResult {
  documents?: any[];
  modifiedCount?: number;
  deletedCount?: number;
  insertedCount?: number;
  insertedIds?: any[];
  matchedCount?: number;
  upsertedCount?: number;
  upsertedIds?: any[];
  executionStats?: {
    executionTimeMs: number;
    totalDocsExamined: number;
    totalKeysExamined: number;
    documentsReturned: number;
    indexesUsed: string[];
  };
  error?: string;
}

export interface MongoExplainResult {
  queryPlanner: {
    plannerVersion: number;
    namespace: string;
    indexFilterSet: boolean;
    parsedQuery: any;
    winningPlan: MongoExecutionPlan;
    rejectedPlans: MongoExecutionPlan[];
  };
  executionStats?: {
    executionSuccess: boolean;
    nReturned: number;
    executionTimeMillis: number;
    totalKeysExamined: number;
    totalDocsExamined: number;
    executionStages: MongoExecutionStage;
  };
}

export interface MongoExecutionPlan {
  stage: string;
  inputStage?: MongoExecutionPlan;
  inputStages?: MongoExecutionPlan[];
  indexName?: string;
  direction?: 'forward' | 'backward';
  bounds?: any;
}

export interface MongoExecutionStage {
  stage: string;
  nReturned: number;
  executionTimeMillisEstimate: number;
  works: number;
  advanced: number;
  needTime: number;
  needYield: number;
  saveState: number;
  restoreState: number;
  isEOF: boolean;
  invalidates: number;
  inputStage?: MongoExecutionStage;
  inputStages?: MongoExecutionStage[];
}

export interface NPMAnalysis {
  id: string;
  name: string;
  packageName: string;
  version?: string;
  analysis: {
    bundleSize?: number;
    dependencies?: string[];
    devDependencies?: string[];
    peerDependencies?: string[];
    vulnerabilities?: number;
    lastUpdated?: string;
  };
  timestamp: number;
}

// Legacy interface for backwards compatibility
export interface EnvironmentConfig {
  id: string;
  name: string;
  variables: Record<string, string>;
  description?: string;
  environment: 'development' | 'staging' | 'production' | 'test' | 'custom';
  timestamp: number;
}

// Comprehensive Environment Variable Manager Types
export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  description?: string;
  category?: string;
  required?: boolean;
  sensitive?: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'url' | 'email' | 'json' | 'base64';
  validationRules?: ValidationRule[];
  defaultValue?: string;
  example?: string;
  tags?: string[];
  deprecated?: boolean;
  lastUpdated: number;
}

export interface ValidationRule {
  id: string;
  type: 'regex' | 'length' | 'range' | 'enum' | 'url' | 'email' | 'json' | 'custom';
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  allowedValues?: string[];
  customValidator?: string;
  errorMessage?: string;
}

export interface EnvEnvironment {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  variables: EnvVariable[];
  inheritsFrom?: string; // Parent environment ID
  category: 'development' | 'testing' | 'staging' | 'production' | 'custom';
  settings: {
    allowInheritance: boolean;
    requireAllVariables: boolean;
    maskSensitive: boolean;
    validateOnSave: boolean;
  };
  metadata: {
    created: number;
    lastModified: number;
    version: string;
    author?: string;
    tags?: string[];
  };
}

export interface EnvTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  framework?: 'nodejs' | 'react' | 'nextjs' | 'express' | 'nestjs' | 'vue' | 'angular' | 'python' | 'docker' | 'kubernetes';
  variables: Omit<EnvVariable, 'id'>[];
  documentation?: string;
  setupInstructions?: string[];
  tags: string[];
}

export interface SecurityPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  category: 'secret' | 'api_key' | 'password' | 'token' | 'certificate' | 'database_url';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  securityIssues: SecurityIssue[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  rule: string;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
  severity: 'warning';
}

export interface SecurityIssue {
  field: string;
  pattern: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  category: string;
}

export interface FormatExportResult {
  format: ExportFormat;
  content: string;
  filename: string;
  success: boolean;
  error?: string;
}

export interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  mimeType: string;
  supportsComments: boolean;
  supportsGrouping: boolean;
  supportsInheritance: boolean;
}

export interface EnvComparison {
  environment1: string;
  environment2: string;
  added: EnvVariable[];
  removed: EnvVariable[];
  modified: Array<{
    key: string;
    oldValue: string;
    newValue: string;
    field: 'value' | 'description' | 'category' | 'dataType';
  }>;
  unchanged: EnvVariable[];
}

export interface EnvBackup {
  id: string;
  name: string;
  environments: EnvEnvironment[];
  timestamp: number;
  version: string;
  description?: string;
  automatic: boolean;
}

export interface EnvDocumentation {
  environment: string;
  generatedAt: number;
  format: 'markdown' | 'html' | 'json' | 'yaml';
  content: string;
  sections: {
    overview: boolean;
    variables: boolean;
    setup: boolean;
    examples: boolean;
    security: boolean;
  };
}

export interface CloudProviderConfig {
  id: string;
  name: string;
  provider: 'aws-parameter-store' | 'aws-secrets-manager' | 'azure-key-vault' | 'gcp-secret-manager' | 'heroku' | 'vercel' | 'netlify';
  configuration: Record<string, string>;
  mappingRules: VariableMapping[];
}

export interface VariableMapping {
  localKey: string;
  remoteKey: string;
  transform?: 'uppercase' | 'lowercase' | 'snake_case' | 'kebab-case' | 'camelCase';
  prefix?: string;
  suffix?: string;
}

export interface IntegrationSettings {
  docker: {
    generateDockerfile: boolean;
    generateDockerCompose: boolean;
    useMultiStage: boolean;
    baseImage?: string;
  };
  kubernetes: {
    generateConfigMap: boolean;
    generateSecret: boolean;
    namespace?: string;
    labels?: Record<string, string>;
  };
  cicd: {
    platform: 'github-actions' | 'gitlab-ci' | 'jenkins' | 'azure-devops' | 'circleci';
    generateConfig: boolean;
    environmentStrategy: 'branches' | 'tags' | 'manual';
  };
}

export interface LegacyDatabaseSchema {
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      primaryKey: boolean;
      foreignKey?: {
        table: string;
        column: string;
      };
    }>;
  }>;
}

export interface QueryResult {
  columns: string[];
  rows: Array<Record<string, string | number | boolean | null>>;
  rowCount: number;
  executionTime: number;
  error?: string;
}

// Visual Query Builder Interfaces
export interface VisualQuery {
  id: string;
  name: string;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE_TABLE' | 'ALTER_TABLE';
  dialect: 'mysql' | 'postgresql' | 'sqlite' | 'mssql' | 'oracle';
  tables: QueryTable[];
  joins: QueryJoin[];
  selectColumns: SelectedColumn[];
  whereConditions: WhereCondition[];
  groupByColumns: string[];
  havingConditions: WhereCondition[];
  orderByColumns: OrderByColumn[];
  limit?: number;
  offset?: number;
  insertData?: InsertData;
  updateData?: UpdateData;
  createTableData?: CreateTableData;
  subqueries?: VisualQuery[];
  ctes?: CTE[];
  windowFunctions?: WindowFunction[];
  unions?: UnionOperation[];
  description?: string;
  timestamp: number;
}

export interface QueryTable {
  id: string;
  name: string;
  alias?: string;
  schema?: string;
  position: { x: number; y: number };
  columns: TableColumn[];
}

export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: ForeignKeyReference;
  defaultValue?: string | number | boolean | null;
  autoIncrement?: boolean;
  unique?: boolean;
  index?: boolean;
}

export interface ForeignKeyReference {
  table: string;
  column: string;
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
}

export interface QueryJoin {
  id: string;
  type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';
  leftTable: string;
  rightTable: string;
  conditions: JoinCondition[];
}

export interface JoinCondition {
  leftColumn: string;
  operator: '=' | '<>' | '<' | '>' | '<=' | '>=';
  rightColumn: string;
}

export interface SelectedColumn {
  id: string;
  table?: string;
  column: string;
  alias?: string;
  aggregateFunction?: 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX' | 'GROUP_CONCAT';
  isExpression?: boolean;
  expression?: string;
}

export interface WhereCondition {
  id: string;
  column: string;
  operator: '=' | '<>' | '<' | '>' | '<=' | '>=' | 'LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL';
  value: string | number | boolean | null | string[];
  value2?: string | number | boolean | null; // For BETWEEN
  logicalOperator?: 'AND' | 'OR';
  groupStart?: boolean;
  groupEnd?: boolean;
  isSubquery?: boolean;
  subquery?: VisualQuery;
}

export interface OrderByColumn {
  column: string;
  direction: 'ASC' | 'DESC';
  nullsFirst?: boolean;
}

export interface InsertData {
  columns: string[];
  values: Array<Record<string, string | number | boolean | null>>;
  onConflict?: 'IGNORE' | 'UPDATE' | 'REPLACE';
}

export interface UpdateData {
  setClause: Array<{
    column: string;
    value: string | number | boolean | null;
    isExpression?: boolean;
  }>;
}

export interface CreateTableData {
  tableName: string;
  columns: CreateTableColumn[];
  primaryKey?: string[];
  foreignKeys?: CreateTableForeignKey[];
  indexes?: CreateTableIndex[];
  constraints?: CreateTableConstraint[];
  ifNotExists?: boolean;
}

export interface CreateTableColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string | number | boolean | null;
  autoIncrement?: boolean;
  unique?: boolean;
  comment?: string;
}

export interface CreateTableForeignKey {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
}

export interface CreateTableIndex {
  name: string;
  columns: string[];
  type?: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
  unique?: boolean;
}

export interface CreateTableConstraint {
  name: string;
  type: 'CHECK' | 'UNIQUE';
  definition: string;
}

export interface CTE {
  id: string;
  name: string;
  query: VisualQuery;
  columns?: string[];
  recursive?: boolean;
}

export interface WindowFunction {
  id: string;
  function: 'ROW_NUMBER' | 'RANK' | 'DENSE_RANK' | 'LAG' | 'LEAD' | 'SUM' | 'AVG' | 'COUNT';
  column?: string;
  partitionBy?: string[];
  orderBy?: OrderByColumn[];
  frameStart?: 'UNBOUNDED_PRECEDING' | 'CURRENT_ROW' | number;
  frameEnd?: 'UNBOUNDED_FOLLOWING' | 'CURRENT_ROW' | number;
  alias: string;
}

export interface UnionOperation {
  id: string;
  type: 'UNION' | 'UNION_ALL' | 'INTERSECT' | 'EXCEPT';
  query: VisualQuery;
}

export interface QueryTemplate {
  id: string;
  name: string;
  category: 'basic' | 'joins' | 'aggregates' | 'subqueries' | 'window_functions' | 'cte';
  description: string;
  query: VisualQuery;
  tags: string[];
}

export interface DatabaseSchema {
  name: string;
  tables: SchemaTable[];
  views?: SchemaView[];
  functions?: SchemaFunction[];
  procedures?: SchemaProcedure[];
}

export interface SchemaTable {
  name: string;
  schema?: string;
  columns: TableColumn[];
  primaryKey?: string[];
  foreignKeys?: ForeignKeyReference[];
  indexes?: TableIndex[];
  constraints?: TableConstraint[];
  rowCount?: number;
  estimatedSize?: number;
  comment?: string;
}

export interface SchemaView {
  name: string;
  schema?: string;
  definition: string;
  columns: TableColumn[];
}

export interface SchemaFunction {
  name: string;
  schema?: string;
  parameters: FunctionParameter[];
  returnType: string;
  definition: string;
}

export interface SchemaProcedure {
  name: string;
  schema?: string;
  parameters: FunctionParameter[];
  definition: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INOUT';
  defaultValue?: string | number | boolean | null;
}

export interface TableIndex {
  name: string;
  columns: string[];
  type: 'BTREE' | 'HASH' | 'FULLTEXT' | 'SPATIAL';
  unique: boolean;
}

export interface TableConstraint {
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN_KEY';
  definition: string;
}

export interface QueryOptimization {
  suggestions: OptimizationSuggestion[];
  estimatedCost: number;
  indexRecommendations: IndexRecommendation[];
}

export interface OptimizationSuggestion {
  type: 'performance' | 'syntax' | 'security' | 'best_practice';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  line?: number;
  column?: number;
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'single' | 'composite';
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

export interface QueryExecution {
  sql: string;
  result?: QueryResult;
  executionPlan?: ExecutionPlan;
  optimization?: QueryOptimization;
  history: QueryHistoryEntry[];
}

export interface ExecutionPlan {
  steps: PlanStep[];
  totalCost: number;
  estimatedRows: number;
}

export interface PlanStep {
  id: string;
  operation: string;
  table?: string;
  index?: string;
  cost: number;
  rows: number;
  children?: PlanStep[];
}

export interface QueryHistoryEntry {
  sql: string;
  timestamp: number;
  executionTime: number;
  rowCount: number;
  success: boolean;
  error?: string;
}

export interface StorageData {
  apiRequests: APIRequest[];
  webSocketConnections: WebSocketConnection[];
  mockEndpoints: MockEndpoint[];
  jsonFormats: Array<{
    id: string;
    name: string;
    content: string;
    timestamp: number;
  }>;
  base64Conversions: Array<{
    id: string;
    name: string;
    original: string;
    encoded: string;
    timestamp: number;
  }>;
  // New database and analysis tools
  sqlQueries: SQLQuery[];
  databaseConnections: DatabaseConnection[];
  mongoQueries: MongoQuery[];
  mongoTemplates: MongoTemplate[];
  mongoSchemas: MongoSchema[];
  npmAnalyses: NPMAnalysis[];
  environmentConfigs: EnvironmentConfig[];
  // Visual Query Builder
  visualQueries: VisualQuery[];
  queryTemplates: QueryTemplate[];
  databaseSchemas: DatabaseSchema[];
  // Connection builder specific
  connectionTemplates?: ConnectionTemplate[];
  // Comprehensive Environment Variable Manager
  envEnvironments: EnvEnvironment[];
  envTemplates: EnvTemplate[];
  envBackups: EnvBackup[];
  cloudProviderConfigs: CloudProviderConfig[];
  integrationSettings: IntegrationSettings;
  // Platform features
  favoriteTools: string[];
  recentTools: ToolUsage[];
  userPreferences: UserPreferences;
  crossToolData: CrossToolData;
  platformErrors: PlatformError[];
}

// Platform Enhancement Interfaces
export interface ToolUsage {
  toolId: string;
  timestamp: number;
  duration?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  favoriteCategory?: string;
  notifications: boolean;
  autoSave: boolean;
  keyboardShortcuts: boolean;
}

export interface CrossToolData {
  sharedConnections: DatabaseConnection[];
  exportedQueries: ExportedQuery[];
  apiResponses: APIResponse[];
  globalVariables: Record<string, string>;
}

export interface ExportedQuery {
  id: string;
  toolId: string;
  name: string;
  type: 'sql' | 'mongodb' | 'api';
  query: string;
  metadata: Record<string, any>;
  timestamp: number;
}

export interface APIResponse {
  id: string;
  url: string;
  method: string;
  response: string;
  headers: Record<string, string>;
  timestamp: number;
}

export interface PlatformError {
  id: string;
  toolId: string;
  error: Error;
  timestamp: number;
  resolved: boolean;
}

export interface NotificationConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface HelpSection {
  id: string;
  title: string;
  content: string;
  category: string;
  toolId?: string;
  order: number;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: string;
  category: string;
}