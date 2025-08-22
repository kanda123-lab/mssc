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
public class MongoQueryRequest {
    private String operation; // find, aggregate, insertOne, etc.
    private String collection;
    private String database;
    private String connectionString;
    
    // Query components
    private Map<String, Object> filter;
    private List<MongoPipelineStage> pipeline;
    private Map<String, Object> document;
    private List<Map<String, Object>> documents;
    private Map<String, Object> update;
    private MongoQueryOptions options;
    
    // Metadata
    private String queryName;
    private String description;
    private List<String> tags;
    private Long timestamp;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MongoPipelineStage {
        private String stage; // $match, $group, etc.
        private Map<String, Object> config;
        private Boolean enabled;
        private Integer order;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MongoQueryOptions {
        private Integer limit;
        private Integer skip;
        private Map<String, Integer> sort;
        private Map<String, Integer> projection;
        private String hint;
        private Integer maxTimeMS;
        private String readPreference;
        private Map<String, Object> readConcern;
        private Map<String, Object> writeConcern;
        private Boolean upsert;
    }
}