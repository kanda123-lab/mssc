package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImageMetadataDto {
    
    // Basic image information
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private Integer width;
    private Integer height;
    private String colorSpace;
    private Integer bitDepth;
    
    // Camera settings (EXIF data)
    private String cameraMake;
    private String cameraModel;
    private String lensModel;
    private String iso;
    private String aperture;
    private String shutterSpeed;
    private String focalLength;
    private String exposureMode;
    private String whiteBalance;
    private String flash;
    private LocalDateTime dateTimeTaken;
    
    // GPS information
    private Double latitude;
    private Double longitude;
    private String gpsLatitudeRef;
    private String gpsLongitudeRef;
    private Double altitude;
    
    // Processing information
    private LocalDateTime processedDateTime;
    private String xmpFilePath;
    private String textFilePath;
    
    // Additional metadata
    private Map<String, String> additionalMetadata;
    
    // Color and tone settings extracted from EXIF
    private String whiteBalanceMode;
    private Integer whiteBalanceTemperature;
    private Integer whiteBalanceTint;
    private String colorMode;
    private String saturation;
    private String contrast;
    private String sharpness;
    private String brightness;
    private String pictureStyle;
    private String iccProfile;
    private String meteringMode;
    private String sceneMode;
    private String digitalZoom;
}