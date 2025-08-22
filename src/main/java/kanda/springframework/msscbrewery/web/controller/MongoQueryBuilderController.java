package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.*;
import kanda.springframework.msscbrewery.web.services.MongoQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/mongo")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "file://"})
public class MongoQueryBuilderController {

    private final MongoQueryService mongoQueryService;

    /**
     * Execute a MongoDB query
     */
    @PostMapping("/execute")
    public ResponseEntity<MongoQueryResult> executeQuery(@RequestBody MongoQueryRequest request) {
        try {
            log.info("Executing MongoDB query: {}", request.getOperation());
            MongoQueryResult result = mongoQueryService.executeQuery(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error executing MongoDB query", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoQueryResult.builder()
                            .success(false)
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Validate a MongoDB query without executing it
     */
    @PostMapping("/validate")
    public ResponseEntity<MongoQueryValidation> validateQuery(@RequestBody MongoQueryRequest request) {
        try {
            MongoQueryValidation validation = mongoQueryService.validateQuery(request);
            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            log.error("Error validating MongoDB query", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoQueryValidation.builder()
                            .valid(false)
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Generate code for different programming languages
     */
    @PostMapping("/generate-code")
    public ResponseEntity<Map<String, String>> generateCode(@RequestBody CodeGenerationRequest request) {
        try {
            Map<String, String> generatedCode = mongoQueryService.generateCode(request);
            return ResponseEntity.ok(generatedCode);
        } catch (Exception e) {
            log.error("Error generating code", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Infer schema from sample documents
     */
    @PostMapping("/infer-schema")
    public ResponseEntity<MongoSchemaInfo> inferSchema(@RequestBody SchemaInferenceRequest request) {
        try {
            MongoSchemaInfo schema = mongoQueryService.inferSchema(request);
            return ResponseEntity.ok(schema);
        } catch (Exception e) {
            log.error("Error inferring schema", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoSchemaInfo.builder()
                            .collection(request.getCollection())
                            .fields(List.of())
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Get performance recommendations
     */
    @PostMapping("/analyze-performance")
    public ResponseEntity<MongoPerformanceAnalysis> analyzePerformance(@RequestBody MongoQueryRequest request) {
        try {
            MongoPerformanceAnalysis analysis = mongoQueryService.analyzePerformance(request);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            log.error("Error analyzing performance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(MongoPerformanceAnalysis.builder()
                            .recommendations(List.of())
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Get aggregation pipeline preview for each stage
     */
    @PostMapping("/preview-pipeline")
    public ResponseEntity<MongoPipelinePreview> previewPipeline(@RequestBody PipelinePreviewRequest request) {
        try {
            MongoPipelinePreview preview = mongoQueryService.previewPipeline(request);
            return ResponseEntity.ok(preview);
        } catch (Exception e) {
            log.error("Error previewing pipeline", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoPipelinePreview.builder()
                            .stageResults(Map.of())
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Get query templates
     */
    @GetMapping("/templates")
    public ResponseEntity<List<MongoQueryTemplate>> getTemplates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String complexity) {
        try {
            List<MongoQueryTemplate> templates = mongoQueryService.getTemplates(category, complexity);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            log.error("Error fetching templates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    /**
     * Export query in various formats
     */
    @PostMapping("/export")
    public ResponseEntity<MongoQueryExport> exportQuery(@RequestBody QueryExportRequest request) {
        try {
            MongoQueryExport export = mongoQueryService.exportQuery(request);
            return ResponseEntity.ok(export);
        } catch (Exception e) {
            log.error("Error exporting query", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoQueryExport.builder()
                            .format(request.getFormat())
                            .content("")
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Import query from external formats (MongoDB Compass, etc.)
     */
    @PostMapping("/import")
    public ResponseEntity<MongoQueryRequest> importQuery(@RequestBody QueryImportRequest request) {
        try {
            MongoQueryRequest imported = mongoQueryService.importQuery(request);
            return ResponseEntity.ok(imported);
        } catch (Exception e) {
            log.error("Error importing query", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoQueryRequest.builder()
                            .operation("find")
                            .collection("collection")
                            .build());
        }
    }

    /**
     * Test connection to MongoDB
     */
    @PostMapping("/test-connection")
    public ResponseEntity<MongoConnectionTest> testConnection(@RequestBody MongoConnectionRequest request) {
        try {
            MongoConnectionTest result = mongoQueryService.testConnection(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error testing MongoDB connection", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(MongoConnectionTest.builder()
                            .success(false)
                            .error(e.getMessage())
                            .build());
        }
    }

    /**
     * Get collection information
     */
    @GetMapping("/collections")
    public ResponseEntity<List<MongoCollectionInfo>> getCollections(
            @RequestParam String connectionString,
            @RequestParam String database) {
        try {
            List<MongoCollectionInfo> collections = mongoQueryService.getCollections(connectionString, database);
            return ResponseEntity.ok(collections);
        } catch (Exception e) {
            log.error("Error fetching collections", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    /**
     * Get indexes for a collection
     */
    @GetMapping("/indexes")
    public ResponseEntity<List<MongoIndexInfo>> getIndexes(
            @RequestParam String connectionString,
            @RequestParam String database,
            @RequestParam String collection) {
        try {
            List<MongoIndexInfo> indexes = mongoQueryService.getIndexes(connectionString, database, collection);
            return ResponseEntity.ok(indexes);
        } catch (Exception e) {
            log.error("Error fetching indexes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }
}