package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Builder
@Jacksonized
public class AlternativePackage {
    private String name;
    private String version;
    private String description;
    private long bundleSize;
    private long weeklyDownloads;
    private int githubStars;
    private double qualityScore;
    private String migrationDifficulty;
    private List<String> similarities;
    private List<String> differences;
    private String recommendation;
    private ComparisonMetrics comparison;
    
    @Data
    @Builder
    @Jacksonized
    public static class ComparisonMetrics {
        private double sizeDifference;
        private double performanceDifference;
        private double popularityDifference;
        private double maintenanceDifference;
        private double overallScore;
    }
    
    public enum MigrationDifficulty {
        EASY("easy"),
        MODERATE("moderate"), 
        HARD("hard"),
        VERY_HARD("very_hard");
        
        private final String value;
        
        MigrationDifficulty(String value) {
            this.value = value;
        }
        
        public String getValue() {
            return value;
        }
    }
}