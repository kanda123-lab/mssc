package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MongoQueryValidation {
    private Boolean valid;
    private String error;
    private List<String> errors;
    private List<String> warnings;
    private List<PerformanceHint> performanceHints;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceHint {
        private String type;
        private String severity;
        private String message;
        private String suggestion;
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class CodeGenerationRequest {
    private MongoQueryRequest query;
    private String language;
    private String framework;
    private String database;
    private Boolean includeComments;
    private Boolean includeErrorHandling;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class SchemaInferenceRequest {
    private String collection;
    private Object sampleDocument;
    private List<Object> sampleDocuments;
    private String database;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoSchemaInfo {
    private String collection;
    private List<FieldInfo> fields;
    private Long documentCount;
    private Long averageDocumentSize;
    private String error;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldInfo {
        private String name;
        private String type;
        private Boolean required;
        private Boolean unique;
        private Boolean indexed;
        private Object sampleValue;
        private Double frequency;
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoPerformanceAnalysis {
    private List<Recommendation> recommendations;
    private Long estimatedExecutionTime;
    private List<String> indexRecommendations;
    private String error;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Recommendation {
        private String type;
        private String severity;
        private String title;
        private String description;
        private String suggestion;
    }
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PipelinePreviewRequest {
    private String collection;
    private String database;
    private List<MongoQueryRequest.MongoPipelineStage> pipeline;
    private Integer maxDocuments;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoPipelinePreview {
    private java.util.Map<String, List<java.util.Map<String, Object>>> stageResults;
    private Long totalDocuments;
    private String error;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoQueryTemplate {
    private String id;
    private String name;
    private String category;
    private String complexity;
    private String description;
    private MongoQueryRequest query;
    private List<String> tags;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class QueryExportRequest {
    private MongoQueryRequest query;
    private String format;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoQueryExport {
    private String format;
    private String content;
    private String filename;
    private String error;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class QueryImportRequest {
    private String format;
    private String content;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoConnectionRequest {
    private String connectionString;
    private String database;
    private String username;
    private String password;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoConnectionTest {
    private Boolean success;
    private String error;
    private Long responseTime;
    private String serverVersion;
    private List<String> databases;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoCollectionInfo {
    private String name;
    private Long documentCount;
    private Long avgObjSize;
    private Long totalIndexSize;
    private java.util.Map<String, Object> stats;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class MongoIndexInfo {
    private String name;
    private java.util.Map<String, Object> keys;
    private Boolean unique;
    private Boolean sparse;
    private java.util.Map<String, Object> options;
}