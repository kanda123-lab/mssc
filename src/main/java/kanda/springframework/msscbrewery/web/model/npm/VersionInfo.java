package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.time.LocalDateTime;

@Data
@Builder
@Jacksonized
public class VersionInfo {
    private String version;
    private LocalDateTime publishedDate;
    private long bundleSize;
    private boolean deprecated;
    private String deprecationReason;
    private boolean hasVulnerabilities;
    private int vulnerabilityCount;
    private String changeType;
    private String changelog;
}