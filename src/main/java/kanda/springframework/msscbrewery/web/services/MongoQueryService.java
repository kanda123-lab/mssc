package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.*;

import java.util.List;
import java.util.Map;

public interface MongoQueryService {
    
    /**
     * Execute a MongoDB query
     */
    MongoQueryResult executeQuery(MongoQueryRequest request);
    
    /**
     * Validate a MongoDB query without executing it
     */
    MongoQueryValidation validateQuery(MongoQueryRequest request);
    
    /**
     * Generate code for different programming languages
     */
    Map<String, String> generateCode(CodeGenerationRequest request);
    
    /**
     * Infer schema from sample documents
     */
    MongoSchemaInfo inferSchema(SchemaInferenceRequest request);
    
    /**
     * Analyze query performance and provide recommendations
     */
    MongoPerformanceAnalysis analyzePerformance(MongoQueryRequest request);
    
    /**
     * Preview aggregation pipeline results for each stage
     */
    MongoPipelinePreview previewPipeline(PipelinePreviewRequest request);
    
    /**
     * Get query templates
     */
    List<MongoQueryTemplate> getTemplates(String category, String complexity);
    
    /**
     * Export query in various formats
     */
    MongoQueryExport exportQuery(QueryExportRequest request);
    
    /**
     * Import query from external formats
     */
    MongoQueryRequest importQuery(QueryImportRequest request);
    
    /**
     * Test MongoDB connection
     */
    MongoConnectionTest testConnection(MongoConnectionRequest request);
    
    /**
     * Get collections from database
     */
    List<MongoCollectionInfo> getCollections(String connectionString, String database);
    
    /**
     * Get indexes for a collection
     */
    List<MongoIndexInfo> getIndexes(String connectionString, String database, String collection);
}