package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageUploadResponse {
    private String message;
    private String fileName;
    private Long fileSize;
    private ImageMetadataDto metadata;
    private String xmpDownloadUrl;
    private String textDownloadUrl;
    private boolean success;
}