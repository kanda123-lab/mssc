package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MongoQueryResult {
    private Boolean success;
    private String error;
    private List<Map<String, Object>> documents;
    
    // Operation results
    private Long insertedCount;
    private List<String> insertedIds;
    private Long modifiedCount;
    private Long deletedCount;
    private Long matchedCount;
    private Long upsertedCount;
    private List<String> upsertedIds;
    
    // Execution statistics
    private MongoExecutionStats executionStats;
    private MongoExplainResult explainResult;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MongoExecutionStats {
        private Long executionTimeMs;
        private Long totalDocsExamined;
        private Long totalDocsReturned;
        private Long totalKeysExamined;
        private String indexName;
        private Boolean indexUsed;
        private Double docsExaminedPercent;
        private String stage;
        private Map<String, Object> additionalStats;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MongoExplainResult {
        private Map<String, Object> queryPlanner;
        private Map<String, Object> executionStats;
        private String serverInfo;
        private Boolean ok;
    }
}