package kanda.springframework.msscbrewery.web.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import kanda.springframework.msscbrewery.web.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MongoQueryServiceImpl implements MongoQueryService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public MongoQueryResult executeQuery(MongoQueryRequest request) {
        log.info("Executing MongoDB query: {} on collection: {}", request.getOperation(), request.getCollection());
        
        // Since this is a demo implementation, we'll simulate query execution
        try {
            Thread.sleep(ThreadLocalRandom.current().nextInt(500, 2000)); // Simulate execution time
            
            return switch (request.getOperation().toLowerCase()) {
                case "find" -> simulateFindQuery(request);
                case "aggregate" -> simulateAggregateQuery(request);
                case "insertone", "insertmany" -> simulateInsertQuery(request);
                case "updateone", "updatemany" -> simulateUpdateQuery(request);
                case "deleteone", "deletemany" -> simulateDeleteQuery(request);
                default -> MongoQueryResult.builder()
                        .success(false)
                        .error("Unsupported operation: " + request.getOperation())
                        .build();
            };
        } catch (Exception e) {
            log.error("Error executing query", e);
            return MongoQueryResult.builder()
                    .success(false)
                    .error(e.getMessage())
                    .build();
        }
    }

    private MongoQueryResult simulateFindQuery(MongoQueryRequest request) {
        // Generate sample documents based on collection name and filters
        List<Map<String, Object>> documents = generateSampleDocuments(request.getCollection(), 
                request.getOptions() != null ? request.getOptions().getLimit() : 10);
        
        return MongoQueryResult.builder()
                .success(true)
                .documents(documents)
                .executionStats(MongoQueryResult.MongoExecutionStats.builder()
                        .executionTimeMs((long) ThreadLocalRandom.current().nextInt(50, 500))
                        .totalDocsExamined((long) documents.size() * 2)
                        .totalDocsReturned((long) documents.size())
                        .totalKeysExamined((long) documents.size())
                        .indexUsed(true)
                        .indexName("idx_sample")
                        .docsExaminedPercent(50.0)
                        .build())
                .build();
    }

    private MongoQueryResult simulateAggregateQuery(MongoQueryRequest request) {
        List<Map<String, Object>> documents;
        
        if (request.getPipeline() != null && !request.getPipeline().isEmpty()) {
            // Simulate pipeline processing
            documents = generateAggregatedDocuments(request.getPipeline(), request.getCollection());
        } else {
            documents = generateSampleDocuments(request.getCollection(), 5);
        }
        
        return MongoQueryResult.builder()
                .success(true)
                .documents(documents)
                .executionStats(MongoQueryResult.MongoExecutionStats.builder()
                        .executionTimeMs((long) ThreadLocalRandom.current().nextInt(100, 1000))
                        .totalDocsExamined(1000L)
                        .totalDocsReturned((long) documents.size())
                        .totalKeysExamined(500L)
                        .indexUsed(false)
                        .build())
                .build();
    }

    private MongoQueryResult simulateInsertQuery(MongoQueryRequest request) {
        boolean isMany = request.getOperation().equalsIgnoreCase("insertmany");
        long insertedCount = isMany ? 
                (request.getDocuments() != null ? request.getDocuments().size() : 1) : 1;
        
        List<String> insertedIds = new ArrayList<>();
        for (int i = 0; i < insertedCount; i++) {
            insertedIds.add(generateObjectId());
        }
        
        return MongoQueryResult.builder()
                .success(true)
                .insertedCount(insertedCount)
                .insertedIds(insertedIds)
                .executionStats(MongoQueryResult.MongoExecutionStats.builder()
                        .executionTimeMs((long) ThreadLocalRandom.current().nextInt(10, 100))
                        .build())
                .build();
    }

    private MongoQueryResult simulateUpdateQuery(MongoQueryRequest request) {
        boolean isMany = request.getOperation().equalsIgnoreCase("updatemany");
        long matchedCount = ThreadLocalRandom.current().nextInt(1, isMany ? 10 : 2);
        long modifiedCount = matchedCount;
        
        return MongoQueryResult.builder()
                .success(true)
                .matchedCount(matchedCount)
                .modifiedCount(modifiedCount)
                .executionStats(MongoQueryResult.MongoExecutionStats.builder()
                        .executionTimeMs((long) ThreadLocalRandom.current().nextInt(20, 200))
                        .totalDocsExamined(matchedCount * 2)
                        .build())
                .build();
    }

    private MongoQueryResult simulateDeleteQuery(MongoQueryRequest request) {
        boolean isMany = request.getOperation().equalsIgnoreCase("deletemany");
        long deletedCount = ThreadLocalRandom.current().nextInt(1, isMany ? 5 : 2);
        
        return MongoQueryResult.builder()
                .success(true)
                .deletedCount(deletedCount)
                .executionStats(MongoQueryResult.MongoExecutionStats.builder()
                        .executionTimeMs((long) ThreadLocalRandom.current().nextInt(15, 150))
                        .totalDocsExamined(deletedCount * 3)
                        .build())
                .build();
    }

    private List<Map<String, Object>> generateSampleDocuments(String collection, int count) {
        List<Map<String, Object>> documents = new ArrayList<>();
        
        for (int i = 0; i < count; i++) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("_id", generateObjectId());
            
            switch (collection.toLowerCase()) {
                case "users" -> {
                    doc.put("name", "User " + (i + 1));
                    doc.put("email", "user" + (i + 1) + "@example.com");
                    doc.put("age", ThreadLocalRandom.current().nextInt(18, 70));
                    doc.put("status", i % 2 == 0 ? "active" : "inactive");
                    doc.put("createdAt", new Date());
                    doc.put("profile", Map.of(
                            "bio", "This is user " + (i + 1),
                            "location", "City " + (i + 1),
                            "interests", List.of("tech", "music", "sports")
                    ));
                }
                case "products" -> {
                    doc.put("name", "Product " + (i + 1));
                    doc.put("category", i % 3 == 0 ? "electronics" : i % 3 == 1 ? "books" : "clothing");
                    doc.put("price", ThreadLocalRandom.current().nextDouble(10.0, 1000.0));
                    doc.put("inStock", ThreadLocalRandom.current().nextBoolean());
                    doc.put("tags", List.of("tag1", "tag2", "tag3"));
                    doc.put("specs", Map.of(
                            "weight", ThreadLocalRandom.current().nextDouble(0.5, 10.0),
                            "dimensions", Map.of("width", 10, "height", 5, "depth", 2)
                    ));
                }
                case "orders" -> {
                    doc.put("orderId", "ORD-" + String.format("%06d", i + 1));
                    doc.put("customerId", generateObjectId());
                    doc.put("total", ThreadLocalRandom.current().nextDouble(50.0, 500.0));
                    doc.put("status", i % 4 == 0 ? "pending" : i % 4 == 1 ? "processing" : i % 4 == 2 ? "shipped" : "delivered");
                    doc.put("items", List.of(
                            Map.of("productId", generateObjectId(), "quantity", 2, "price", 25.99),
                            Map.of("productId", generateObjectId(), "quantity", 1, "price", 49.99)
                    ));
                    doc.put("orderDate", new Date());
                }
                default -> {
                    doc.put("field1", "value" + (i + 1));
                    doc.put("field2", ThreadLocalRandom.current().nextInt(1, 100));
                    doc.put("field3", ThreadLocalRandom.current().nextBoolean());
                    doc.put("nested", Map.of("subfield", "subvalue" + (i + 1)));
                }
            }
            
            documents.add(doc);
        }
        
        return documents;
    }

    private List<Map<String, Object>> generateAggregatedDocuments(List<MongoQueryRequest.MongoPipelineStage> pipeline, String collection) {
        // Simulate aggregation results based on pipeline stages
        boolean hasGroup = pipeline.stream().anyMatch(stage -> "$group".equals(stage.getStage()));
        boolean hasMatch = pipeline.stream().anyMatch(stage -> "$match".equals(stage.getStage()));
        
        List<Map<String, Object>> results = new ArrayList<>();
        
        if (hasGroup) {
            // Generate grouped results
            for (int i = 0; i < 5; i++) {
                Map<String, Object> result = new HashMap<>();
                result.put("_id", "category" + (i + 1));
                result.put("count", ThreadLocalRandom.current().nextInt(10, 100));
                result.put("averagePrice", ThreadLocalRandom.current().nextDouble(20.0, 200.0));
                result.put("totalRevenue", ThreadLocalRandom.current().nextDouble(1000.0, 10000.0));
                results.add(result);
            }
        } else {
            // Generate filtered/transformed results
            results = generateSampleDocuments(collection, 8);
        }
        
        return results;
    }

    private String generateObjectId() {
        return String.format("%024x", ThreadLocalRandom.current().nextLong(0, Long.MAX_VALUE));
    }

    @Override
    public MongoQueryValidation validateQuery(MongoQueryRequest request) {
        // Simple validation logic
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (request.getCollection() == null || request.getCollection().trim().isEmpty()) {
            errors.add("Collection name is required");
        }
        
        if (request.getOperation() == null) {
            errors.add("Operation is required");
        }
        
        if ("aggregate".equals(request.getOperation()) && 
            (request.getPipeline() == null || request.getPipeline().isEmpty())) {
            warnings.add("Empty aggregation pipeline");
        }
        
        return MongoQueryValidation.builder()
                .valid(errors.isEmpty())
                .errors(errors)
                .warnings(warnings)
                .build();
    }

    @Override
    public Map<String, String> generateCode(CodeGenerationRequest request) {
        Map<String, String> codeMap = new HashMap<>();
        
        // Generate basic code templates for different languages
        codeMap.put("javascript", generateJavaScriptCode(request));
        codeMap.put("python", generatePythonCode(request));
        codeMap.put("java", generateJavaCode(request));
        codeMap.put("shell", generateMongoShellCode(request));
        
        return codeMap;
    }

    private String generateJavaScriptCode(CodeGenerationRequest request) {
        return String.format("""
                // Node.js MongoDB Code
                const { MongoClient } = require('mongodb');
                
                async function executeQuery() {
                    const client = new MongoClient('mongodb://localhost:27017');
                    await client.connect();
                    
                    const db = client.db('%s');
                    const collection = db.collection('%s');
                    
                    const result = await collection.%s();
                    console.log(result);
                    
                    await client.close();
                }
                
                executeQuery().catch(console.error);
                """, 
                request.getDatabase() != null ? request.getDatabase() : "database",
                request.getQuery().getCollection(),
                request.getQuery().getOperation());
    }

    private String generatePythonCode(CodeGenerationRequest request) {
        return String.format("""
                # Python MongoDB Code
                from pymongo import MongoClient
                
                client = MongoClient('mongodb://localhost:27017')
                db = client['%s']
                collection = db['%s']
                
                result = collection.%s()
                for doc in result:
                    print(doc)
                
                client.close()
                """,
                request.getDatabase() != null ? request.getDatabase() : "database",
                request.getQuery().getCollection(),
                request.getQuery().getOperation());
    }

    private String generateJavaCode(CodeGenerationRequest request) {
        return String.format("""
                // Java MongoDB Code
                import com.mongodb.client.MongoClient;
                import com.mongodb.client.MongoClients;
                import com.mongodb.client.MongoCollection;
                import com.mongodb.client.MongoDatabase;
                import org.bson.Document;
                
                public class MongoQuery {
                    public static void main(String[] args) {
                        MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");
                        MongoDatabase database = mongoClient.getDatabase("%s");
                        MongoCollection<Document> collection = database.getCollection("%s");
                        
                        // Execute %s operation
                        collection.find().forEach(System.out::println);
                        
                        mongoClient.close();
                    }
                }
                """,
                request.getDatabase() != null ? request.getDatabase() : "database",
                request.getQuery().getCollection(),
                request.getQuery().getOperation());
    }

    private String generateMongoShellCode(CodeGenerationRequest request) {
        return String.format("db.%s.%s()", 
                request.getQuery().getCollection(), 
                request.getQuery().getOperation());
    }

    @Override
    public MongoSchemaInfo inferSchema(SchemaInferenceRequest request) {
        // Mock schema inference
        List<MongoSchemaInfo.FieldInfo> fields = new ArrayList<>();
        
        // Add common fields based on collection name
        switch (request.getCollection().toLowerCase()) {
            case "users" -> {
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("_id").type("objectId").required(true).indexed(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("name").type("string").required(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("email").type("string").required(true).unique(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("age").type("number").build());
            }
            case "products" -> {
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("_id").type("objectId").required(true).indexed(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("name").type("string").required(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("category").type("string").indexed(true).build());
                fields.add(MongoSchemaInfo.FieldInfo.builder()
                        .name("price").type("number").build());
            }
        }
        
        return MongoSchemaInfo.builder()
                .collection(request.getCollection())
                .fields(fields)
                .documentCount(1000L)
                .averageDocumentSize(2048L)
                .build();
    }

    @Override
    public MongoPerformanceAnalysis analyzePerformance(MongoQueryRequest request) {
        // Mock performance analysis
        List<MongoPerformanceAnalysis.Recommendation> recommendations = new ArrayList<>();
        
        if (request.getFilter() == null || request.getFilter().isEmpty()) {
            recommendations.add(MongoPerformanceAnalysis.Recommendation.builder()
                    .type("query")
                    .severity("medium")
                    .title("No filter specified")
                    .description("Query without filters may return large result sets")
                    .suggestion("Add appropriate filters to limit results")
                    .build());
        }
        
        if ("find".equals(request.getOperation()) && 
            (request.getOptions() == null || request.getOptions().getLimit() == null)) {
            recommendations.add(MongoPerformanceAnalysis.Recommendation.builder()
                    .type("query")
                    .severity("low")
                    .title("No limit specified")
                    .description("Queries without limits may impact performance")
                    .suggestion("Consider adding a limit to control result size")
                    .build());
        }
        
        return MongoPerformanceAnalysis.builder()
                .recommendations(recommendations)
                .estimatedExecutionTime(100L)
                .indexRecommendations(List.of("Create index on frequently queried fields"))
                .build();
    }

    @Override
    public MongoPipelinePreview previewPipeline(PipelinePreviewRequest request) {
        Map<String, List<Map<String, Object>>> stageResults = new HashMap<>();
        
        if (request.getPipeline() != null) {
            for (int i = 0; i < request.getPipeline().size(); i++) {
                String stageId = "stage_" + i;
                List<Map<String, Object>> results = generateSampleDocuments(request.getCollection(), 3);
                stageResults.put(stageId, results);
            }
        }
        
        return MongoPipelinePreview.builder()
                .stageResults(stageResults)
                .totalDocuments(1000L)
                .build();
    }

    @Override
    public List<MongoQueryTemplate> getTemplates(String category, String complexity) {
        List<MongoQueryTemplate> templates = new ArrayList<>();
        
        templates.add(MongoQueryTemplate.builder()
                .id("basic-find")
                .name("Basic Find Query")
                .category("basic")
                .complexity("beginner")
                .description("Simple find query with filters")
                .query(MongoQueryRequest.builder()
                        .operation("find")
                        .collection("collection")
                        .filter(Map.of("status", "active"))
                        .build())
                .tags(List.of("find", "basic"))
                .build());
        
        templates.add(MongoQueryTemplate.builder()
                .id("group-aggregation")
                .name("Group Aggregation")
                .category("aggregation")
                .complexity("intermediate")
                .description("Group documents by field with count")
                .query(MongoQueryRequest.builder()
                        .operation("aggregate")
                        .collection("collection")
                        .pipeline(List.of(
                                MongoQueryRequest.MongoPipelineStage.builder()
                                        .stage("$group")
                                        .config(Map.of("_id", "$category", "count", Map.of("$sum", 1)))
                                        .build()
                        ))
                        .build())
                .tags(List.of("aggregate", "group"))
                .build());
        
        return templates.stream()
                .filter(t -> category == null || category.equals(t.getCategory()))
                .filter(t -> complexity == null || complexity.equals(t.getComplexity()))
                .collect(Collectors.toList());
    }

    @Override
    public MongoQueryExport exportQuery(QueryExportRequest request) {
        String content = switch (request.getFormat().toLowerCase()) {
            case "json" -> exportAsJson(request.getQuery());
            case "shell" -> exportAsShell(request.getQuery());
            case "compass" -> exportAsCompass(request.getQuery());
            default -> "Unsupported format: " + request.getFormat();
        };
        
        return MongoQueryExport.builder()
                .format(request.getFormat())
                .content(content)
                .filename(generateFilename(request.getQuery(), request.getFormat()))
                .build();
    }

    private String exportAsJson(MongoQueryRequest query) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(query);
        } catch (Exception e) {
            return "Error exporting to JSON: " + e.getMessage();
        }
    }

    private String exportAsShell(MongoQueryRequest query) {
        return String.format("db.%s.%s(%s)", 
                query.getCollection(), 
                query.getOperation(),
                query.getFilter() != null ? query.getFilter().toString() : "");
    }

    private String exportAsCompass(MongoQueryRequest query) {
        // MongoDB Compass export format
        return String.format("""
                {
                  "collection": "%s",
                  "query": %s,
                  "options": {}
                }
                """, 
                query.getCollection(),
                query.getFilter() != null ? query.getFilter().toString() : "{}");
    }

    private String generateFilename(MongoQueryRequest query, String format) {
        return String.format("%s_%s_query.%s", 
                query.getCollection(), 
                query.getOperation(),
                format.toLowerCase());
    }

    @Override
    public MongoQueryRequest importQuery(QueryImportRequest request) {
        // Mock import - in real implementation, would parse the imported content
        return MongoQueryRequest.builder()
                .operation("find")
                .collection("imported_collection")
                .filter(Map.of("imported", true))
                .build();
    }

    @Override
    public MongoConnectionTest testConnection(MongoConnectionRequest request) {
        // Mock connection test
        try {
            Thread.sleep(1000); // Simulate connection time
            
            return MongoConnectionTest.builder()
                    .success(true)
                    .responseTime(150L)
                    .serverVersion("6.0.3")
                    .databases(List.of("admin", "test", "sampledb"))
                    .build();
        } catch (InterruptedException e) {
            return MongoConnectionTest.builder()
                    .success(false)
                    .error("Connection timeout")
                    .build();
        }
    }

    @Override
    public List<MongoCollectionInfo> getCollections(String connectionString, String database) {
        // Mock collections
        return List.of(
                MongoCollectionInfo.builder()
                        .name("users")
                        .documentCount(1500L)
                        .avgObjSize(2048L)
                        .totalIndexSize(65536L)
                        .build(),
                MongoCollectionInfo.builder()
                        .name("products")
                        .documentCount(850L)
                        .avgObjSize(1536L)
                        .totalIndexSize(32768L)
                        .build(),
                MongoCollectionInfo.builder()
                        .name("orders")
                        .documentCount(5200L)
                        .avgObjSize(3072L)
                        .totalIndexSize(131072L)
                        .build()
        );
    }

    @Override
    public List<MongoIndexInfo> getIndexes(String connectionString, String database, String collection) {
        // Mock indexes
        return List.of(
                MongoIndexInfo.builder()
                        .name("_id_")
                        .keys(Map.of("_id", 1))
                        .unique(true)
                        .build(),
                MongoIndexInfo.builder()
                        .name("email_1")
                        .keys(Map.of("email", 1))
                        .unique(true)
                        .build(),
                MongoIndexInfo.builder()
                        .name("status_createdAt_1")
                        .keys(Map.of("status", 1, "createdAt", -1))
                        .unique(false)
                        .build()
        );
    }
}