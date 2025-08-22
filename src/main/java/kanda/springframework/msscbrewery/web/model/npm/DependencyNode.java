package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Builder
@Jacksonized
public class DependencyNode {
    private String name;
    private String version;
    private String resolvedVersion;
    private String dependencyType;
    private long bundleSize;
    private int depth;
    private boolean isDirect;
    private boolean isOptional;
    private boolean hasSecurity;
    private List<DependencyNode> children;
    
    public enum DependencyType {
        PRODUCTION("dependencies"),
        DEVELOPMENT("devDependencies"),
        PEER("peerDependencies"),
        OPTIONAL("optionalDependencies"),
        BUNDLED("bundledDependencies");
        
        private final String jsonKey;
        
        DependencyType(String jsonKey) {
            this.jsonKey = jsonKey;
        }
        
        public String getJsonKey() {
            return jsonKey;
        }
    }
}