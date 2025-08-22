package kanda.springframework.msscbrewery.web.model.npm;

import lombok.Builder;
import lombok.Data;
import lombok.extern.jackson.Jacksonized;

import java.util.List;

@Data
@Builder
@Jacksonized
public class VersionConflict {
    private String packageName;
    private List<String> conflictingVersions;
    private List<String> dependentPackages;
    private String recommendedVersion;
    private String severity;
    private String resolution;
}