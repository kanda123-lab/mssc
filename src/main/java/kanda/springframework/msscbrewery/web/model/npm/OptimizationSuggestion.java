package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

@Data
@Builder
@Jacksonized
public class OptimizationSuggestion {
    private String type;
    private String title;
    private String description;
    private String impact;
    private long potentialSavings;
    private String difficulty;
    private String recommendation;
    private String codeExample;
    
    public enum Type {
        REMOVE_UNUSED("remove_unused"),
        TREE_SHAKING("tree_shaking"),
        CODE_SPLITTING("code_splitting"),
        DYNAMIC_IMPORT("dynamic_import"),
        BUNDLE_SPLITTING("bundle_splitting"),
        ALTERNATIVE_PACKAGE("alternative_package"),
        VERSION_UPDATE("version_update"),
        PEER_DEPENDENCY("peer_dependency");
        
        private final String value;
        
        Type(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
    
    public enum Impact {
        LOW("low"),
        MEDIUM("medium"),
        HIGH("high"),
        VERY_HIGH("very_high");
        
        private final String value;
        
        Impact(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}