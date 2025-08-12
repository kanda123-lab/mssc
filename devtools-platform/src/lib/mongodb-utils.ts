import {
  MongoQuery,
  MongoOperation,
  MongoPipelineStage,
  MongoStageType,
  MongoFilter,
  MongoCondition,
  MongoOperator,
  MongoDataType,
  MongoUpdate,
  MongoUpdateOperator,
  MongoQueryOptions,
  MongoIndex,
  MongoSchema,
  MongoField,
  MongoTemplate,
  MongoValidationResult,
  MongoValidationError,
  MongoValidationWarning,
  MongoPerformanceHint,
  MongoGeoQuery,
  MongoTextSearchQuery,
  MongoTimeSeriesQuery,
  MongoQueryResult,
} from '@/types';

// MongoDB Stage Configuration Templates
export const MONGO_STAGE_TEMPLATES: Record<MongoStageType, any> = {
  '$match': {},
  '$group': {
    _id: null,
  },
  '$sort': {},
  '$limit': 10,
  '$skip': 0,
  '$project': {},
  '$unwind': {
    path: '',
    preserveNullAndEmptyArrays: false,
  },
  '$lookup': {
    from: '',
    localField: '',
    foreignField: '',
    as: '',
  },
  '$facet': {},
  '$bucket': {
    groupBy: '',
    boundaries: [],
    default: 'Other',
  },
  '$bucketAuto': {
    groupBy: '',
    buckets: 5,
  },
  '$addFields': {},
  '$replaceRoot': {
    newRoot: '',
  },
  '$replaceWith': '',
  '$sample': {
    size: 10,
  },
  '$sortByCount': '',
  '$redact': '',
  '$geoNear': {
    near: { type: 'Point', coordinates: [0, 0] },
    distanceField: 'distance',
  },
  '$indexStats': {},
  '$collStats': {},
  '$out': '',
  '$merge': {
    into: '',
  },
  '$unionWith': {
    coll: '',
  },
};

// MongoDB Operators by Category
export const MONGO_OPERATORS_BY_CATEGORY = {
  comparison: ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'],
  logical: ['$and', '$or', '$not', '$nor'],
  element: ['$exists', '$type'],
  evaluation: ['$regex', '$text', '$where', '$jsonSchema'],
  array: ['$all', '$elemMatch', '$size'],
  geospatial: ['$geoWithin', '$geoIntersects', '$near', '$nearSphere'],
  bitwise: ['$bitsAllClear', '$bitsAllSet', '$bitsAnyClear', '$bitsAnySet'],
};

// Data Type Mappings
export const MONGO_DATA_TYPES: Record<MongoDataType, { label: string; bsonType: number | string }> = {
  string: { label: 'String', bsonType: 'string' },
  number: { label: 'Number', bsonType: 'number' },
  boolean: { label: 'Boolean', bsonType: 'bool' },
  date: { label: 'Date', bsonType: 'date' },
  objectId: { label: 'ObjectId', bsonType: 'objectId' },
  array: { label: 'Array', bsonType: 'array' },
  object: { label: 'Object', bsonType: 'object' },
  null: { label: 'Null', bsonType: 'null' },
  regex: { label: 'Regex', bsonType: 'regex' },
  binary: { label: 'Binary', bsonType: 'binData' },
  decimal128: { label: 'Decimal128', bsonType: 'decimal' },
};

/**
 * Generate MongoDB query from query object
 */
export function generateMongoQuery(query: MongoQuery): string {
  const { operation, collection, filter, document, documents, update, options, pipeline } = query;

  switch (operation) {
    case 'find':
      return generateFindQuery(collection, filter, options);
    case 'insertOne':
      return generateInsertOneQuery(collection, document);
    case 'insertMany':
      return generateInsertManyQuery(collection, documents);
    case 'updateOne':
    case 'updateMany':
      return generateUpdateQuery(collection, operation, filter, update, options);
    case 'replaceOne':
      return generateReplaceQuery(collection, filter, document, options);
    case 'deleteOne':
    case 'deleteMany':
      return generateDeleteQuery(collection, operation, filter, options);
    case 'aggregate':
      return generateAggregateQuery(collection, pipeline);
    case 'createIndex':
      return generateCreateIndexQuery(collection, query.index);
    case 'dropIndex':
      return generateDropIndexQuery(collection, query.indexName);
    case 'distinct':
      return generateDistinctQuery(collection, query.field, filter);
    case 'count':
    case 'countDocuments':
      return generateCountQuery(collection, operation, filter);
    default:
      return `db.${collection}.${operation}()`;
  }
}

function generateFindQuery(collection: string, filter?: MongoFilter, options?: MongoQueryOptions): string {
  let query = `db.${collection}.find(`;
  
  // Add filter
  if (filter && filter.conditions.length > 0) {
    query += buildFilterObject(filter);
  } else {
    query += '{}';
  }

  // Add projection
  if (options?.projection) {
    query += `, ${JSON.stringify(options.projection)}`;
  }

  query += ')';

  // Add chained methods
  if (options?.sort) {
    query += `.sort(${JSON.stringify(options.sort)})`;
  }
  if (options?.limit) {
    query += `.limit(${options.limit})`;
  }
  if (options?.skip) {
    query += `.skip(${options.skip})`;
  }

  return query;
}

function generateInsertOneQuery(collection: string, document?: Record<string, any>): string {
  return `db.${collection}.insertOne(${JSON.stringify(document || {}, null, 2)})`;
}

function generateInsertManyQuery(collection: string, documents?: Record<string, any>[]): string {
  return `db.${collection}.insertMany(${JSON.stringify(documents || [], null, 2)})`;
}

function generateUpdateQuery(
  collection: string, 
  operation: 'updateOne' | 'updateMany', 
  filter?: MongoFilter, 
  update?: MongoUpdate,
  options?: MongoQueryOptions
): string {
  let query = `db.${collection}.${operation}(`;
  
  // Add filter
  if (filter && filter.conditions.length > 0) {
    query += buildFilterObject(filter);
  } else {
    query += '{}';
  }

  // Add update document
  if (update) {
    query += `, ${buildUpdateObject(update)}`;
  } else {
    query += ', {}';
  }

  // Add options
  if (options && (options.upsert || options.writeConcern)) {
    const opts: any = {};
    if (options.upsert) opts.upsert = options.upsert;
    if (options.writeConcern) opts.writeConcern = options.writeConcern;
    query += `, ${JSON.stringify(opts)}`;
  }

  query += ')';
  return query;
}

function generateReplaceQuery(
  collection: string,
  filter?: MongoFilter,
  document?: Record<string, any>,
  options?: MongoQueryOptions
): string {
  let query = `db.${collection}.replaceOne(`;
  
  if (filter && filter.conditions.length > 0) {
    query += buildFilterObject(filter);
  } else {
    query += '{}';
  }

  query += `, ${JSON.stringify(document || {})}`;

  if (options?.upsert) {
    query += `, { upsert: true }`;
  }

  query += ')';
  return query;
}

function generateDeleteQuery(
  collection: string,
  operation: 'deleteOne' | 'deleteMany',
  filter?: MongoFilter,
  options?: MongoQueryOptions
): string {
  let query = `db.${collection}.${operation}(`;
  
  if (filter && filter.conditions.length > 0) {
    query += buildFilterObject(filter);
  } else {
    query += '{}';
  }

  if (options?.writeConcern) {
    query += `, { writeConcern: ${JSON.stringify(options.writeConcern)} }`;
  }

  query += ')';
  return query;
}

function generateAggregateQuery(collection: string, pipeline?: MongoPipelineStage[]): string {
  if (!pipeline || pipeline.length === 0) {
    return `db.${collection}.aggregate([])`;
  }

  const stages = pipeline
    .filter(stage => stage.enabled)
    .sort((a, b) => a.order - b.order)
    .map(stage => `{ ${stage.stage}: ${JSON.stringify(stage.config, null, 2)} }`);

  return `db.${collection}.aggregate([\n  ${stages.join(',\n  ')}\n])`;
}

function generateCreateIndexQuery(collection: string, index?: MongoIndex): string {
  if (!index) {
    return `db.${collection}.createIndex({})`;
  }

  let query = `db.${collection}.createIndex(${JSON.stringify(index.keys)}`;
  
  if (index.options && Object.keys(index.options).length > 0) {
    query += `, ${JSON.stringify(index.options)}`;
  }

  query += ')';
  return query;
}

function generateDropIndexQuery(collection: string, indexName?: string): string {
  return `db.${collection}.dropIndex(${indexName ? `"${indexName}"` : '""'})`;
}

function generateDistinctQuery(collection: string, field?: string, filter?: MongoFilter): string {
  let query = `db.${collection}.distinct("${field || 'field'}"`;
  
  if (filter && filter.conditions.length > 0) {
    query += `, ${buildFilterObject(filter)}`;
  }

  query += ')';
  return query;
}

function generateCountQuery(collection: string, operation: string, filter?: MongoFilter): string {
  let query = `db.${collection}.${operation}(`;
  
  if (filter && filter.conditions.length > 0) {
    query += buildFilterObject(filter);
  } else if (operation === 'countDocuments') {
    query += '{}';
  }

  query += ')';
  return query;
}

/**
 * Build MongoDB filter object from filter conditions
 */
export function buildFilterObject(filter: MongoFilter): string {
  if (!filter || filter.conditions.length === 0) {
    return '{}';
  }

  if (filter.conditions.length === 1 && !filter.conditions[0].groupStart) {
    const condition = filter.conditions[0];
    return JSON.stringify(buildCondition(condition), null, 2);
  }

  // Handle complex filters with AND/OR logic
  const filterObj: any = {};
  const groups: any[] = [];
  let currentGroup: any[] = [];
  let groupDepth = 0;

  for (const condition of filter.conditions) {
    if (condition.groupStart) {
      if (groupDepth === 0) {
        currentGroup = [];
      }
      groupDepth++;
    }

    const conditionObj = buildCondition(condition);
    
    if (groupDepth > 0) {
      currentGroup.push(conditionObj);
    } else {
      groups.push(conditionObj);
    }

    if (condition.groupEnd) {
      groupDepth--;
      if (groupDepth === 0 && currentGroup.length > 0) {
        const groupLogic = condition.logic || 'AND';
        if (groupLogic === 'OR') {
          groups.push({ $or: currentGroup });
        } else {
          groups.push({ $and: currentGroup });
        }
        currentGroup = [];
      }
    }
  }

  // Combine all conditions
  if (groups.length === 1) {
    return JSON.stringify(groups[0], null, 2);
  } else if (groups.length > 1) {
    const rootLogic = filter.logic || 'AND';
    if (rootLogic === 'OR') {
      return JSON.stringify({ $or: groups }, null, 2);
    } else {
      return JSON.stringify({ $and: groups }, null, 2);
    }
  }

  return '{}';
}

function buildCondition(condition: MongoCondition): any {
  const { field, operator, value, dataType, not } = condition;
  let conditionObj: any = {};

  // Handle special operators
  switch (operator) {
    case '$exists':
      conditionObj[field] = { $exists: Boolean(value) };
      break;
    case '$type':
      conditionObj[field] = { $type: MONGO_DATA_TYPES[dataType]?.bsonType || dataType };
      break;
    case '$regex':
      conditionObj[field] = { $regex: value, $options: 'i' };
      break;
    case '$text':
      conditionObj = { $text: { $search: value } };
      break;
    case '$where':
      conditionObj = { $where: value };
      break;
    case '$size':
      conditionObj[field] = { $size: parseInt(value) };
      break;
    case '$mod':
      conditionObj[field] = { $mod: Array.isArray(value) ? value : [value, 0] };
      break;
    case '$all':
      conditionObj[field] = { $all: Array.isArray(value) ? value : [value] };
      break;
    case '$elemMatch':
      conditionObj[field] = { $elemMatch: typeof value === 'object' ? value : {} };
      break;
    default:
      // Handle comparison operators
      if (operator === '$eq') {
        conditionObj[field] = formatValue(value, dataType);
      } else {
        conditionObj[field] = { [operator]: formatValue(value, dataType) };
      }
  }

  // Apply NOT logic
  if (not) {
    conditionObj = { $not: conditionObj };
  }

  return conditionObj;
}

function buildUpdateObject(update: MongoUpdate): string {
  if (update.type === 'replace') {
    return JSON.stringify(update.operations[0]?.value || {}, null, 2);
  }

  const updateObj: any = {};
  
  for (const operation of update.operations) {
    if (!updateObj[operation.operator]) {
      updateObj[operation.operator] = {};
    }
    updateObj[operation.operator][operation.field] = operation.value;
  }

  return JSON.stringify(updateObj, null, 2);
}

function formatValue(value: any, dataType: MongoDataType): any {
  switch (dataType) {
    case 'number':
      return parseFloat(value) || 0;
    case 'boolean':
      return Boolean(value);
    case 'date':
      return value instanceof Date ? value : new Date(value);
    case 'objectId':
      return `ObjectId("${value}")`;
    case 'array':
      return Array.isArray(value) ? value : [value];
    case 'object':
      return typeof value === 'object' ? value : {};
    case 'null':
      return null;
    case 'regex':
      return new RegExp(value);
    default:
      return String(value);
  }
}

/**
 * Generate code for different programming languages
 */
export function generateMongoCode(query: MongoQuery, language: string): string {
  switch (language) {
    case 'shell':
      return generateMongoQuery(query);
    case 'nodejs':
      return generateNodeJSCode(query);
    case 'python':
      return generatePythonCode(query);
    case 'java':
      return generateJavaCode(query);
    case 'csharp':
      return generateCSharpCode(query);
    case 'php':
      return generatePHPCode(query);
    default:
      return generateMongoQuery(query);
  }
}

function generateNodeJSCode(query: MongoQuery): string {
  const { operation, collection, filter, document, documents, pipeline, options } = query;

  let code = `// Node.js with MongoDB driver\nconst { MongoClient } = require('mongodb');\n\n`;
  code += `async function ${operation}Query() {\n`;
  code += `  const client = new MongoClient('mongodb://localhost:27017');\n`;
  code += `  await client.connect();\n`;
  code += `  const db = client.db('database');\n`;
  code += `  const collection = db.collection('${collection}');\n\n`;

  switch (operation) {
    case 'find':
      code += `  const result = await collection.find(`;
      if (filter && filter.conditions.length > 0) {
        code += buildFilterObject(filter);
      } else {
        code += '{}';
      }
      if (options?.projection) {
        code += `, { projection: ${JSON.stringify(options.projection)} }`;
      }
      code += `)`;
      if (options?.limit) code += `.limit(${options.limit})`;
      if (options?.skip) code += `.skip(${options.skip})`;
      if (options?.sort) code += `.sort(${JSON.stringify(options.sort)})`;
      code += `.toArray();\n`;
      break;
    case 'aggregate':
      if (pipeline && pipeline.length > 0) {
        const stages = pipeline
          .filter(stage => stage.enabled)
          .sort((a, b) => a.order - b.order)
          .map(stage => `{ ${stage.stage}: ${JSON.stringify(stage.config)} }`);
        code += `  const result = await collection.aggregate([\n    ${stages.join(',\n    ')}\n  ]).toArray();\n`;
      } else {
        code += `  const result = await collection.aggregate([]).toArray();\n`;
      }
      break;
    case 'insertOne':
      code += `  const result = await collection.insertOne(${JSON.stringify(document || {}, null, 2)});\n`;
      break;
    case 'insertMany':
      code += `  const result = await collection.insertMany(${JSON.stringify(documents || [], null, 2)});\n`;
      break;
    default:
      code += `  const result = await collection.${operation}();\n`;
  }

  code += `  console.log(result);\n`;
  code += `  await client.close();\n`;
  code += `}\n\n${operation}Query();`;

  return code;
}

function generatePythonCode(query: MongoQuery): string {
  const { operation, collection, filter, document, documents, pipeline, options } = query;

  let code = `# Python with PyMongo\nfrom pymongo import MongoClient\nfrom datetime import datetime\n\n`;
  code += `def ${operation}_query():\n`;
  code += `    client = MongoClient('mongodb://localhost:27017')\n`;
  code += `    db = client.database\n`;
  code += `    collection = db.${collection}\n\n`;

  switch (operation) {
    case 'find':
      code += `    result = collection.find(`;
      if (filter && filter.conditions.length > 0) {
        code += buildFilterObject(filter).replace(/"/g, "'");
      } else {
        code += '{}';
      }
      if (options?.projection) {
        code += `, ${JSON.stringify(options.projection).replace(/"/g, "'")}`;
      }
      code += `)`;
      if (options?.limit) code += `.limit(${options.limit})`;
      if (options?.skip) code += `.skip(${options.skip})`;
      if (options?.sort) code += `.sort(${JSON.stringify(options.sort).replace(/"/g, "'")})`;
      code += `\n    for doc in result:\n        print(doc)\n`;
      break;
    case 'aggregate':
      if (pipeline && pipeline.length > 0) {
        const stages = pipeline
          .filter(stage => stage.enabled)
          .sort((a, b) => a.order - b.order)
          .map(stage => `{"${stage.stage}": ${JSON.stringify(stage.config).replace(/"/g, "'")}}`);
        code += `    result = collection.aggregate([\n        ${stages.join(',\n        ')}\n    ])\n`;
      } else {
        code += `    result = collection.aggregate([])\n`;
      }
      code += `    for doc in result:\n        print(doc)\n`;
      break;
    case 'insertOne':
      code += `    result = collection.insert_one(${JSON.stringify(document || {}, null, 4).replace(/"/g, "'")})\n`;
      code += `    print(f"Inserted document with id: {result.inserted_id}")\n`;
      break;
    case 'insertMany':
      code += `    result = collection.insert_many(${JSON.stringify(documents || [], null, 4).replace(/"/g, "'")})\n`;
      code += `    print(f"Inserted {len(result.inserted_ids)} documents")\n`;
      break;
    default:
      code += `    result = collection.${operation}()\n    print(result)\n`;
  }

  code += `    client.close()\n\n`;
  code += `if __name__ == "__main__":\n    ${operation}_query()`;

  return code;
}

function generateJavaCode(query: MongoQuery): string {
  const { operation, collection } = query;

  let code = `// Java with MongoDB Driver\n`;
  code += `import com.mongodb.client.MongoClient;\n`;
  code += `import com.mongodb.client.MongoClients;\n`;
  code += `import com.mongodb.client.MongoCollection;\n`;
  code += `import com.mongodb.client.MongoDatabase;\n`;
  code += `import org.bson.Document;\n\n`;
  code += `public class MongoQuery {\n`;
  code += `    public static void main(String[] args) {\n`;
  code += `        MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");\n`;
  code += `        MongoDatabase database = mongoClient.getDatabase("database");\n`;
  code += `        MongoCollection<Document> collection = database.getCollection("${collection}");\n\n`;

  switch (operation) {
    case 'find':
      code += `        // Find documents\n`;
      code += `        collection.find().forEach(System.out::println);\n`;
      break;
    case 'aggregate':
      code += `        // Aggregation pipeline\n`;
      code += `        collection.aggregate(Arrays.asList(\n`;
      code += `            // Add pipeline stages here\n`;
      code += `        )).forEach(System.out::println);\n`;
      break;
    case 'insertOne':
      code += `        // Insert one document\n`;
      code += `        Document document = new Document("field", "value");\n`;
      code += `        collection.insertOne(document);\n`;
      break;
    default:
      code += `        // ${operation} operation\n`;
      code += `        System.out.println("Performing ${operation} operation");\n`;
  }

  code += `\n        mongoClient.close();\n`;
  code += `    }\n`;
  code += `}`;

  return code;
}

function generateCSharpCode(query: MongoQuery): string {
  const { operation, collection } = query;

  let code = `// C# with MongoDB Driver\n`;
  code += `using MongoDB.Driver;\n`;
  code += `using MongoDB.Bson;\n\n`;
  code += `class Program\n{\n`;
  code += `    static async Task Main(string[] args)\n    {\n`;
  code += `        var client = new MongoClient("mongodb://localhost:27017");\n`;
  code += `        var database = client.GetDatabase("database");\n`;
  code += `        var collection = database.GetCollection<BsonDocument>("${collection}");\n\n`;

  switch (operation) {
    case 'find':
      code += `        // Find documents\n`;
      code += `        var result = await collection.Find(new BsonDocument()).ToListAsync();\n`;
      code += `        foreach (var doc in result)\n        {\n            Console.WriteLine(doc);\n        }\n`;
      break;
    case 'aggregate':
      code += `        // Aggregation pipeline\n`;
      code += `        var pipeline = new BsonDocument[]\n        {\n`;
      code += `            // Add pipeline stages here\n`;
      code += `        };\n`;
      code += `        var result = await collection.AggregateAsync<BsonDocument>(pipeline);\n`;
      break;
    case 'insertOne':
      code += `        // Insert one document\n`;
      code += `        var document = new BsonDocument { { "field", "value" } };\n`;
      code += `        await collection.InsertOneAsync(document);\n`;
      break;
    default:
      code += `        // ${operation} operation\n`;
      code += `        Console.WriteLine("Performing ${operation} operation");\n`;
  }

  code += `    }\n`;
  code += `}`;

  return code;
}

function generatePHPCode(query: MongoQuery): string {
  const { operation, collection } = query;

  let code = `<?php\n// PHP with MongoDB Driver\n`;
  code += `require_once 'vendor/autoload.php';\n\n`;
  code += `$client = new MongoDB\\Client("mongodb://localhost:27017");\n`;
  code += `$database = $client->database;\n`;
  code += `$collection = $database->${collection};\n\n`;

  switch (operation) {
    case 'find':
      code += `// Find documents\n`;
      code += `$result = $collection->find([]);\n`;
      code += `foreach ($result as $document) {\n    print_r($document);\n}\n`;
      break;
    case 'aggregate':
      code += `// Aggregation pipeline\n`;
      code += `$pipeline = [\n    // Add pipeline stages here\n];\n`;
      code += `$result = $collection->aggregate($pipeline);\n`;
      code += `foreach ($result as $document) {\n    print_r($document);\n}\n`;
      break;
    case 'insertOne':
      code += `// Insert one document\n`;
      code += `$document = ['field' => 'value'];\n`;
      code += `$result = $collection->insertOne($document);\n`;
      code += `echo "Inserted document with id: " . $result->getInsertedId();\n`;
      break;
    default:
      code += `// ${operation} operation\n`;
      code += `echo "Performing ${operation} operation";\n`;
  }

  code += `\n?>`;

  return code;
}

/**
 * Validate MongoDB query
 */
export function validateMongoQuery(query: MongoQuery): MongoValidationResult {
  const errors: MongoValidationError[] = [];
  const warnings: MongoValidationWarning[] = [];
  const performance: MongoPerformanceHint[] = [];

  // Basic validation
  if (!query.collection?.trim()) {
    errors.push({
      message: 'Collection name is required',
      code: 'MISSING_COLLECTION'
    });
  }

  // Operation-specific validation
  switch (query.operation) {
    case 'find':
      validateFindQuery(query, errors, warnings, performance);
      break;
    case 'aggregate':
      validateAggregateQuery(query, errors, warnings, performance);
      break;
    case 'insertOne':
      validateInsertOneQuery(query, errors, warnings);
      break;
    case 'insertMany':
      validateInsertManyQuery(query, errors, warnings);
      break;
    case 'updateOne':
    case 'updateMany':
      validateUpdateQuery(query, errors, warnings);
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    performance
  };
}

function validateFindQuery(
  query: MongoQuery, 
  errors: MongoValidationError[], 
  warnings: MongoValidationWarning[], 
  performance: MongoPerformanceHint[]
) {
  // Check for potential performance issues
  if (!query.filter || query.filter.conditions.length === 0) {
    warnings.push({
      message: 'No filter specified - this will return all documents',
      suggestion: 'Add filter conditions to limit results'
    });
  }

  if (!query.options?.limit || query.options.limit > 1000) {
    performance.push({
      type: 'query',
      severity: 'medium',
      message: 'Large result set without limit',
      suggestion: 'Consider adding a limit to improve performance'
    });
  }
}

function validateAggregateQuery(
  query: MongoQuery, 
  errors: MongoValidationError[], 
  warnings: MongoValidationWarning[], 
  performance: MongoPerformanceHint[]
) {
  if (!query.pipeline || query.pipeline.length === 0) {
    warnings.push({
      message: 'Empty aggregation pipeline',
      suggestion: 'Add pipeline stages to perform aggregation operations'
    });
    return;
  }

  const enabledStages = query.pipeline.filter(stage => stage.enabled);
  
  // Check for $match at the beginning
  if (enabledStages.length > 0 && enabledStages[0].stage !== '$match') {
    performance.push({
      type: 'pipeline',
      severity: 'high',
      message: 'Pipeline should start with $match when possible',
      suggestion: 'Place $match stages early in the pipeline to reduce documents processed'
    });
  }

  // Check for $sort after $limit
  for (let i = 0; i < enabledStages.length - 1; i++) {
    if (enabledStages[i].stage === '$limit' && enabledStages[i + 1].stage === '$sort') {
      errors.push({
        stage: '$sort',
        message: '$sort cannot be used after $limit',
        code: 'INVALID_STAGE_ORDER'
      });
    }
  }

  // Validate individual stages
  enabledStages.forEach(stage => {
    validatePipelineStage(stage, errors, warnings, performance);
  });
}

function validateInsertOneQuery(query: MongoQuery, errors: MongoValidationError[], warnings: MongoValidationWarning[]) {
  if (!query.document || Object.keys(query.document).length === 0) {
    errors.push({
      message: 'Document to insert is required',
      code: 'MISSING_DOCUMENT'
    });
  }
}

function validateInsertManyQuery(query: MongoQuery, errors: MongoValidationError[], warnings: MongoValidationWarning[]) {
  if (!query.documents || !Array.isArray(query.documents) || query.documents.length === 0) {
    errors.push({
      message: 'Array of documents to insert is required',
      code: 'MISSING_DOCUMENTS'
    });
  }
}

function validateUpdateQuery(query: MongoQuery, errors: MongoValidationError[], warnings: MongoValidationWarning[]) {
  if (!query.update || !query.update.operations || query.update.operations.length === 0) {
    errors.push({
      message: 'Update operations are required',
      code: 'MISSING_UPDATE'
    });
  }

  if (!query.filter || query.filter.conditions.length === 0) {
    warnings.push({
      message: 'No filter specified for update operation',
      suggestion: 'Consider adding filter conditions to avoid updating all documents'
    });
  }
}

function validatePipelineStage(
  stage: MongoPipelineStage, 
  errors: MongoValidationError[], 
  warnings: MongoValidationWarning[], 
  performance: MongoPerformanceHint[]
) {
  switch (stage.stage) {
    case '$group':
      if (!stage.config._id) {
        errors.push({
          stage: stage.stage,
          message: '$group stage requires _id field',
          code: 'MISSING_GROUP_ID'
        });
      }
      break;
    case '$lookup':
      const requiredFields = ['from', 'localField', 'foreignField', 'as'];
      requiredFields.forEach(field => {
        if (!stage.config[field]) {
          errors.push({
            stage: stage.stage,
            field,
            message: `$lookup stage requires ${field} field`,
            code: 'MISSING_LOOKUP_FIELD'
          });
        }
      });
      break;
    case '$unwind':
      if (!stage.config.path) {
        errors.push({
          stage: stage.stage,
          message: '$unwind stage requires path field',
          code: 'MISSING_UNWIND_PATH'
        });
      }
      break;
  }
}

/**
 * Default MongoDB templates
 */
export function getMongoTemplates(): MongoTemplate[] {
  return [
    {
      id: 'basic-find',
      name: 'Basic Find Query',
      category: 'basic',
      description: 'Simple find query with filter',
      complexity: 'beginner',
      useCase: 'Retrieve documents matching specific criteria',
      tags: ['find', 'filter'],
      query: {
        operation: 'find',
        collection: 'users',
        filter: {
          conditions: [{
            id: '1',
            field: 'status',
            operator: '$eq',
            value: 'active',
            dataType: 'string'
          }],
          logic: 'AND'
        }
      }
    },
    {
      id: 'aggregation-group',
      name: 'Group by Category',
      category: 'aggregation',
      description: 'Group documents by category and count',
      complexity: 'intermediate',
      useCase: 'Analyze data by grouping and counting',
      tags: ['aggregate', 'group', 'count'],
      query: {
        operation: 'aggregate',
        collection: 'products',
        pipeline: [
          {
            id: '1',
            stage: '$match',
            config: { status: 'active' },
            enabled: true,
            order: 0
          },
          {
            id: '2',
            stage: '$group',
            config: {
              _id: '$category',
              count: { $sum: 1 },
              avgPrice: { $avg: '$price' }
            },
            enabled: true,
            order: 1
          },
          {
            id: '3',
            stage: '$sort',
            config: { count: -1 },
            enabled: true,
            order: 2
          }
        ]
      }
    },
    {
      id: 'lookup-join',
      name: 'Join Collections',
      category: 'aggregation',
      description: 'Join two collections using $lookup',
      complexity: 'advanced',
      useCase: 'Combine data from multiple collections',
      tags: ['aggregate', 'lookup', 'join'],
      query: {
        operation: 'aggregate',
        collection: 'orders',
        pipeline: [
          {
            id: '1',
            stage: '$lookup',
            config: {
              from: 'customers',
              localField: 'customerId',
              foreignField: '_id',
              as: 'customer'
            },
            enabled: true,
            order: 0
          },
          {
            id: '2',
            stage: '$unwind',
            config: {
              path: '$customer',
              preserveNullAndEmptyArrays: false
            },
            enabled: true,
            order: 1
          }
        ]
      }
    }
  ];
}

/**
 * Infer schema from sample document
 */
export function inferSchemaFromDocument(document: Record<string, any>, collection: string): MongoSchema {
  const fields = extractFieldsFromObject(document, '');
  
  return {
    collection,
    fields,
    sampleDocument: document,
    stats: {
      documentCount: 0,
      avgDocumentSize: JSON.stringify(document).length,
      collectionSize: 0,
      storageSize: 0
    }
  };
}

function extractFieldsFromObject(obj: any, prefix: string): MongoField[] {
  const fields: MongoField[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const dataType = inferDataType(value);
    
    const field: MongoField = {
      name: key,
      path,
      type: dataType,
      required: true, // Assume required for sample
      unique: false,
      indexed: key === '_id',
      sample: value,
      frequency: 1
    };
    
    if (dataType === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      field.nestedFields = extractFieldsFromObject(value, path);
    } else if (dataType === 'array' && Array.isArray(value) && value.length > 0) {
      const arrayItemType = inferDataType(value[0]);
      if (arrayItemType === 'object') {
        field.nestedFields = extractFieldsFromObject(value[0], path);
      }
    }
    
    fields.push(field);
  }
  
  return fields;
}

function inferDataType(value: any): MongoDataType {
  if (value === null) return 'null';
  if (typeof value === 'string') {
    // Check if it looks like an ObjectId
    if (/^[a-f\d]{24}$/i.test(value)) return 'objectId';
    // Check if it looks like a date
    if (!isNaN(Date.parse(value))) return 'date';
    return 'string';
  }
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date) return 'date';
  if (typeof value === 'object') return 'object';
  return 'string';
}