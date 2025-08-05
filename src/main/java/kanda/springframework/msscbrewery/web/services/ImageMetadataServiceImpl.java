package kanda.springframework.msscbrewery.web.services;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import kanda.springframework.msscbrewery.web.model.ImageMetadataDto;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class ImageMetadataServiceImpl implements ImageMetadataService {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String XMP_DIR = "xmp/";
    private static final String TEXT_DIR = "text/";

    @Override
    public ImageMetadataDto extractMetadata(MultipartFile file) throws Exception {
        // Create directories if they don't exist
        createDirectoriesIfNotExist();
        
        ImageMetadataDto.ImageMetadataDtoBuilder builder = ImageMetadataDto.builder()
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .processedDateTime(LocalDateTime.now())
                .additionalMetadata(new HashMap<>());

        try (InputStream inputStream = file.getInputStream()) {
            // Extract metadata using metadata-extractor
            Metadata metadata = ImageMetadataReader.readMetadata(inputStream);
            
            // Extract basic image information and EXIF data
            extractImageInfo(builder, metadata);
            extractExifData(builder, metadata);
            extractColorToneData(builder, metadata);
            extractGpsData(builder, metadata);
            
            // Store additional metadata for debugging
            Map<String, String> additionalMetadata = new HashMap<>();
            for (Directory directory : metadata.getDirectories()) {
                for (Tag tag : directory.getTags()) {
                    additionalMetadata.put(directory.getName() + " - " + tag.getTagName(), tag.getDescription());
                }
            }
            builder.additionalMetadata(additionalMetadata);
            
        } catch (ImageProcessingException | IOException e) {
            // Continue with basic file information even if metadata extraction fails
            System.err.println("Error extracting metadata: " + e.getMessage());
        }

        return builder.build();
    }

    private void extractImageInfo(ImageMetadataDto.ImageMetadataDtoBuilder builder, Metadata metadata) {
        // Try to get image dimensions from various directories
        for (Directory directory : metadata.getDirectories()) {
            if (directory.hasTagName(256)) { // Image width tag
                try {
                    builder.width(directory.getInt(256));
                } catch (Exception e) {
                    // Continue if width extraction fails
                }
            }
            if (directory.hasTagName(257)) { // Image height tag
                try {
                    builder.height(directory.getInt(257));
                } catch (Exception e) {
                    // Continue if height extraction fails
                }
            }
            if (directory.hasTagName(258)) { // Bits per sample
                try {
                    builder.bitDepth(directory.getInt(258));
                } catch (Exception e) {
                    // Continue if bit depth extraction fails
                }
            }
            if (directory.hasTagName(262)) { // Photometric interpretation (color space)
                try {
                    builder.colorSpace(directory.getDescription(262));
                } catch (Exception e) {
                    // Continue if color space extraction fails
                }
            }
        }
    }

    private void extractExifData(ImageMetadataDto.ImageMetadataDtoBuilder builder, Metadata metadata) {
        try {
            // Camera information from EXIF IFD0
            ExifIFD0Directory exifIFD0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            if (exifIFD0 != null) {
                if (exifIFD0.containsTag(ExifIFD0Directory.TAG_MAKE)) {
                    builder.cameraMake(exifIFD0.getString(ExifIFD0Directory.TAG_MAKE));
                }
                if (exifIFD0.containsTag(ExifIFD0Directory.TAG_MODEL)) {
                    builder.cameraModel(exifIFD0.getString(ExifIFD0Directory.TAG_MODEL));
                }
            }

            // Camera settings from EXIF SubIFD
            ExifSubIFDDirectory exifSubIFD = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            if (exifSubIFD != null) {
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT)) {
                    builder.iso(String.valueOf(exifSubIFD.getInt(ExifSubIFDDirectory.TAG_ISO_EQUIVALENT)));
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_FNUMBER)) {
                    try {
                        double aperture = exifSubIFD.getDouble(ExifSubIFDDirectory.TAG_FNUMBER);
                        builder.aperture("f/" + String.format("%.1f", aperture));
                    } catch (Exception e) {
                        builder.aperture(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_FNUMBER));
                    }
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_EXPOSURE_TIME)) {
                    builder.shutterSpeed(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_EXPOSURE_TIME));
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_FOCAL_LENGTH)) {
                    try {
                        double focalLength = exifSubIFD.getDouble(ExifSubIFDDirectory.TAG_FOCAL_LENGTH);
                        builder.focalLength(String.format("%.1f mm", focalLength));
                    } catch (Exception e) {
                        builder.focalLength(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_FOCAL_LENGTH));
                    }
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_EXPOSURE_MODE)) {
                    builder.exposureMode(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_EXPOSURE_MODE));
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_WHITE_BALANCE)) {
                    builder.whiteBalance(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_WHITE_BALANCE));
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_FLASH)) {
                    builder.flash(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_FLASH));
                }
                
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_LENS_MODEL)) {
                    builder.lensModel(exifSubIFD.getString(ExifSubIFDDirectory.TAG_LENS_MODEL));
                }
                
                // Date and time
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL)) {
                    try {
                        String dateTimeStr = exifSubIFD.getString(ExifSubIFDDirectory.TAG_DATETIME_ORIGINAL);
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss");
                        builder.dateTimeTaken(LocalDateTime.parse(dateTimeStr, formatter));
                    } catch (Exception e) {
                        // If parsing fails, skip date
                    }
                }
            }

        } catch (Exception e) {
            // Continue processing even if some EXIF fields are missing
            System.err.println("Error extracting EXIF data: " + e.getMessage());
        }
    }

    private void extractColorToneData(ImageMetadataDto.ImageMetadataDtoBuilder builder, Metadata metadata) {
        try {
            // Extract color and tone settings from various EXIF directories
            ExifSubIFDDirectory exifSubIFD = metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
            ExifIFD0Directory exifIFD0 = metadata.getFirstDirectoryOfType(ExifIFD0Directory.class);
            
            if (exifSubIFD != null) {
                // White Balance
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_WHITE_BALANCE)) {
                    int wb = exifSubIFD.getInt(ExifSubIFDDirectory.TAG_WHITE_BALANCE);
                    builder.whiteBalanceMode(wb == 0 ? "Auto" : "Manual");
                }
                
                // Color Space
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_COLOR_SPACE)) {
                    int colorSpace = exifSubIFD.getInt(ExifSubIFDDirectory.TAG_COLOR_SPACE);
                    builder.colorSpace(colorSpace == 1 ? "sRGB" : colorSpace == 2 ? "Adobe RGB" : "Uncalibrated");
                }
                
                // Saturation
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_SATURATION)) {
                    builder.saturation(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_SATURATION));
                }
                
                // Contrast
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_CONTRAST)) {
                    builder.contrast(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_CONTRAST));
                }
                
                // Sharpness
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_SHARPNESS)) {
                    builder.sharpness(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_SHARPNESS));
                }
                
                // Scene Mode
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_SCENE_CAPTURE_TYPE)) {
                    builder.sceneMode(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_SCENE_CAPTURE_TYPE));
                }
                
                // Metering Mode
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_METERING_MODE)) {
                    builder.meteringMode(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_METERING_MODE));
                }
                
                // Digital Zoom
                if (exifSubIFD.containsTag(ExifSubIFDDirectory.TAG_DIGITAL_ZOOM_RATIO)) {
                    builder.digitalZoom(exifSubIFD.getDescription(ExifSubIFDDirectory.TAG_DIGITAL_ZOOM_RATIO));
                }
            }
            
            if (exifIFD0 != null) {
                // Try to extract color profile information
                if (exifIFD0.containsTag(ExifIFD0Directory.TAG_COLOR_SPACE)) {
                    builder.iccProfile(exifIFD0.getDescription(ExifIFD0Directory.TAG_COLOR_SPACE));
                }
            }
            
            // Try to extract manufacturer-specific color settings
            extractManufacturerColorSettings(builder, metadata);
            
        } catch (Exception e) {
            System.err.println("Error extracting color/tone data: " + e.getMessage());
        }
    }
    
    private void extractManufacturerColorSettings(ImageMetadataDto.ImageMetadataDtoBuilder builder, Metadata metadata) {
        // Look for manufacturer-specific directories that contain color settings
        for (Directory directory : metadata.getDirectories()) {
            String dirName = directory.getName().toLowerCase();
            
            // Canon-specific settings
            if (dirName.contains("canon")) {
                extractCanonColorSettings(builder, directory);
            }
            // Nikon-specific settings  
            else if (dirName.contains("nikon")) {
                extractNikonColorSettings(builder, directory);
            }
            // Sony-specific settings
            else if (dirName.contains("sony")) {
                extractSonyColorSettings(builder, directory);
            }
            // Generic makernote extraction
            else if (dirName.contains("makernote")) {
                extractGenericMakernoteSettings(builder, directory);
            }
        }
    }
    
    private void extractCanonColorSettings(ImageMetadataDto.ImageMetadataDtoBuilder builder, Directory directory) {
        try {
            // Canon Picture Style - iterate through available tags
            for (com.drew.metadata.Tag tag : directory.getTags()) {
                String description = tag.getDescription();
                String tagName = tag.getTagName();
                
                if (tagName != null && description != null) {
                    if (tagName.toLowerCase().contains("picture style") || 
                        tagName.toLowerCase().contains("color mode")) {
                        builder.pictureStyle(description);
                    }
                    if (tagName.toLowerCase().contains("white balance")) {
                        builder.whiteBalanceMode(description);
                    }
                }
            }
        } catch (Exception e) {
            // Continue if extraction fails
        }
    }
    
    private void extractNikonColorSettings(ImageMetadataDto.ImageMetadataDtoBuilder builder, Directory directory) {
        try {
            for (com.drew.metadata.Tag tag : directory.getTags()) {
                String description = tag.getDescription();
                String tagName = tag.getTagName();
                
                if (tagName != null && description != null) {
                    if (tagName.toLowerCase().contains("color mode") || 
                        tagName.toLowerCase().contains("picture control")) {
                        builder.pictureStyle(description);
                    }
                }
            }
        } catch (Exception e) {
            // Continue if extraction fails
        }
    }
    
    private void extractSonyColorSettings(ImageMetadataDto.ImageMetadataDtoBuilder builder, Directory directory) {
        try {
            for (com.drew.metadata.Tag tag : directory.getTags()) {
                String description = tag.getDescription();
                String tagName = tag.getTagName();
                
                if (tagName != null && description != null) {
                    if (tagName.toLowerCase().contains("creative style") || 
                        tagName.toLowerCase().contains("color mode")) {
                        builder.pictureStyle(description);
                    }
                }
            }
        } catch (Exception e) {
            // Continue if extraction fails
        }
    }
    
    private void extractGenericMakernoteSettings(ImageMetadataDto.ImageMetadataDtoBuilder builder, Directory directory) {
        try {
            for (com.drew.metadata.Tag tag : directory.getTags()) {
                String description = tag.getDescription();
                String tagName = tag.getTagName();
                
                if (tagName != null && description != null) {
                    String lowerTagName = tagName.toLowerCase();
                    if (lowerTagName.contains("color") && 
                        (lowerTagName.contains("mode") || lowerTagName.contains("style") || lowerTagName.contains("setting"))) {
                        builder.pictureStyle(description);
                    }
                    if (lowerTagName.contains("white balance") && !lowerTagName.contains("fine")) {
                        builder.whiteBalanceMode(description);
                    }
                }
            }
        } catch (Exception e) {
            // Continue if extraction fails
        }
    }

    private void extractGpsData(ImageMetadataDto.ImageMetadataDtoBuilder builder, Metadata metadata) {
        try {
            GpsDirectory gpsDirectory = metadata.getFirstDirectoryOfType(GpsDirectory.class);
            if (gpsDirectory != null) {
                // Extract GPS coordinates using the proper GeoLocation method
                if (gpsDirectory.getGeoLocation() != null) {
                    builder.latitude(gpsDirectory.getGeoLocation().getLatitude())
                           .longitude(gpsDirectory.getGeoLocation().getLongitude());
                }
                
                if (gpsDirectory.containsTag(GpsDirectory.TAG_LATITUDE_REF)) {
                    builder.gpsLatitudeRef(gpsDirectory.getString(GpsDirectory.TAG_LATITUDE_REF));
                }
                
                if (gpsDirectory.containsTag(GpsDirectory.TAG_LONGITUDE_REF)) {
                    builder.gpsLongitudeRef(gpsDirectory.getString(GpsDirectory.TAG_LONGITUDE_REF));
                }
                
                if (gpsDirectory.containsTag(GpsDirectory.TAG_ALTITUDE)) {
                    try {
                        double altitude = gpsDirectory.getDouble(GpsDirectory.TAG_ALTITUDE);
                        builder.altitude(altitude);
                    } catch (Exception e) {
                        // Continue if altitude extraction fails
                    }
                }
            }

        } catch (Exception e) {
            // Continue processing even if GPS data is missing
            System.err.println("Error extracting GPS data: " + e.getMessage());
        }
    }

    @Override
    public String generateXmpFile(ImageMetadataDto metadata) throws Exception {
        createDirectoriesIfNotExist();
        
        String fileName = metadata.getFileName().replaceAll("\\.[^.]*$", "") + ".xmp";
        String filePath = XMP_DIR + fileName;
        
        try (FileWriter writer = new FileWriter(filePath)) {
            writer.write(generateXmpContent(metadata));
        }
        
        return filePath;
    }

    @Override
    public String generateTextFile(ImageMetadataDto metadata) throws Exception {
        createDirectoriesIfNotExist();
        
        String fileName = metadata.getFileName().replaceAll("\\.[^.]*$", "") + "_metadata.txt";
        String filePath = TEXT_DIR + fileName;
        
        try (FileWriter writer = new FileWriter(filePath)) {
            writer.write(generateTextContent(metadata));
        }
        
        return filePath;
    }

    private String generateXmpContent(ImageMetadataDto metadata) {
        StringBuilder xmp = new StringBuilder();
        xmp.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xmp.append("<x:xmpmeta xmlns:x=\"adobe:ns:meta/\" x:xmptk=\"Adobe XMP Core 7.0-c000 79.217bca6, 2021/06/14-18:28:11\">\n");
        xmp.append("  <rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">\n");
        
        // Main description with multiple namespaces
        xmp.append("    <rdf:Description rdf:about=\"\"\n");
        xmp.append("        xmlns:aux=\"http://ns.adobe.com/exif/1.0/aux/\"\n");
        xmp.append("        xmlns:crs=\"http://ns.adobe.com/camera-raw-settings/1.0/\"\n");
        xmp.append("        xmlns:dc=\"http://purl.org/dc/elements/1.1/\"\n");
        xmp.append("        xmlns:exif=\"http://ns.adobe.com/exif/1.0/\"\n");
        xmp.append("        xmlns:exifEX=\"http://ns.adobe.com/exif/1.0/aux/\"\n");
        xmp.append("        xmlns:photoshop=\"http://ns.adobe.com/photoshop/1.0/\"\n");
        xmp.append("        xmlns:tiff=\"http://ns.adobe.com/tiff/1.0/\"\n");
        xmp.append("        xmlns:xmp=\"http://ns.adobe.com/xap/1.0/\"\n");
        xmp.append("        xmlns:xmpMM=\"http://ns.adobe.com/xap/1.0/mm/\">\n");
        
        // Camera Raw Settings (Lightroom adjustments) - use real extracted data where available
        xmp.append("      <crs:Version>15.4</crs:Version>\n");
        xmp.append("      <crs:ProcessVersion>11.0</crs:ProcessVersion>\n");
        
        // White Balance - use extracted white balance mode if available
        String whiteBalanceMode = metadata.getWhiteBalanceMode() != null ? metadata.getWhiteBalanceMode() : "As Shot";
        xmp.append("      <crs:WhiteBalance>").append(escapeXml(whiteBalanceMode)).append("</crs:WhiteBalance>\n");
        
        // Temperature - use extracted data or default
        int temperature = metadata.getWhiteBalanceTemperature() != null ? metadata.getWhiteBalanceTemperature() : 5500;
        xmp.append("      <crs:Temperature>").append(temperature).append("</crs:Temperature>\n");
        
        int tint = metadata.getWhiteBalanceTint() != null ? metadata.getWhiteBalanceTint() : 0;
        xmp.append("      <crs:Tint>").append(tint).append("</crs:Tint>\n");
        
        // Basic adjustments - start with neutral values but could be enhanced based on EXIF
        xmp.append("      <crs:Exposure2012>0.00</crs:Exposure2012>\n");
        
        // Contrast - use extracted contrast if available, otherwise default
        String contrastValue = mapContrastToLightroom(metadata.getContrast());
        xmp.append("      <crs:Contrast2012>").append(contrastValue).append("</crs:Contrast2012>\n");
        
        xmp.append("      <crs:Highlights2012>0</crs:Highlights2012>\n");
        xmp.append("      <crs:Shadows2012>0</crs:Shadows2012>\n");
        xmp.append("      <crs:Whites2012>0</crs:Whites2012>\n");
        xmp.append("      <crs:Blacks2012>0</crs:Blacks2012>\n");
        xmp.append("      <crs:Texture>0</crs:Texture>\n");
        
        // Clarity - could be mapped from sharpness
        String clarityValue = mapSharpnessToClarity(metadata.getSharpness());
        xmp.append("      <crs:Clarity2012>").append(clarityValue).append("</crs:Clarity2012>\n");
        
        xmp.append("      <crs:Dehaze>0</crs:Dehaze>\n");
        xmp.append("      <crs:Vibrance>0</crs:Vibrance>\n");
        
        // Saturation - use extracted saturation if available
        String saturationValue = mapSaturationToLightroom(metadata.getSaturation());
        xmp.append("      <crs:Saturation>").append(saturationValue).append("</crs:Saturation>\n");
        
        // Color and Tone Curve settings
        xmp.append("      <crs:ParametricShadows>0</crs:ParametricShadows>\n");
        xmp.append("      <crs:ParametricDarks>0</crs:ParametricDarks>\n");
        xmp.append("      <crs:ParametricLights>0</crs:ParametricLights>\n");
        xmp.append("      <crs:ParametricHighlights>0</crs:ParametricHighlights>\n");
        xmp.append("      <crs:ParametricShadowSplit>25</crs:ParametricShadowSplit>\n");
        xmp.append("      <crs:ParametricMidtoneSplit>50</crs:ParametricMidtoneSplit>\n");
        xmp.append("      <crs:ParametricHighlightSplit>75</crs:ParametricHighlightSplit>\n");
        
        // HSL adjustments
        xmp.append("      <crs:HueAdjustmentRed>0</crs:HueAdjustmentRed>\n");
        xmp.append("      <crs:HueAdjustmentOrange>0</crs:HueAdjustmentOrange>\n");
        xmp.append("      <crs:HueAdjustmentYellow>0</crs:HueAdjustmentYellow>\n");
        xmp.append("      <crs:HueAdjustmentGreen>0</crs:HueAdjustmentGreen>\n");
        xmp.append("      <crs:HueAdjustmentAqua>0</crs:HueAdjustmentAqua>\n");
        xmp.append("      <crs:HueAdjustmentBlue>0</crs:HueAdjustmentBlue>\n");
        xmp.append("      <crs:HueAdjustmentPurple>0</crs:HueAdjustmentPurple>\n");
        xmp.append("      <crs:HueAdjustmentMagenta>0</crs:HueAdjustmentMagenta>\n");
        
        xmp.append("      <crs:SaturationAdjustmentRed>0</crs:SaturationAdjustmentRed>\n");
        xmp.append("      <crs:SaturationAdjustmentOrange>0</crs:SaturationAdjustmentOrange>\n");
        xmp.append("      <crs:SaturationAdjustmentYellow>0</crs:SaturationAdjustmentYellow>\n");
        xmp.append("      <crs:SaturationAdjustmentGreen>0</crs:SaturationAdjustmentGreen>\n");
        xmp.append("      <crs:SaturationAdjustmentAqua>0</crs:SaturationAdjustmentAqua>\n");
        xmp.append("      <crs:SaturationAdjustmentBlue>0</crs:SaturationAdjustmentBlue>\n");
        xmp.append("      <crs:SaturationAdjustmentPurple>0</crs:SaturationAdjustmentPurple>\n");
        xmp.append("      <crs:SaturationAdjustmentMagenta>0</crs:SaturationAdjustmentMagenta>\n");
        
        xmp.append("      <crs:LuminanceAdjustmentRed>0</crs:LuminanceAdjustmentRed>\n");
        xmp.append("      <crs:LuminanceAdjustmentOrange>0</crs:LuminanceAdjustmentOrange>\n");
        xmp.append("      <crs:LuminanceAdjustmentYellow>0</crs:LuminanceAdjustmentYellow>\n");
        xmp.append("      <crs:LuminanceAdjustmentGreen>0</crs:LuminanceAdjustmentGreen>\n");
        xmp.append("      <crs:LuminanceAdjustmentAqua>0</crs:LuminanceAdjustmentAqua>\n");
        xmp.append("      <crs:LuminanceAdjustmentBlue>0</crs:LuminanceAdjustmentBlue>\n");
        xmp.append("      <crs:LuminanceAdjustmentPurple>0</crs:LuminanceAdjustmentPurple>\n");
        xmp.append("      <crs:LuminanceAdjustmentMagenta>0</crs:LuminanceAdjustmentMagenta>\n");
        
        // Color grading
        xmp.append("      <crs:ColorGradeMidtoneHue>0</crs:ColorGradeMidtoneHue>\n");
        xmp.append("      <crs:ColorGradeMidtoneSat>0</crs:ColorGradeMidtoneSat>\n");
        xmp.append("      <crs:ColorGradeShadowLum>0</crs:ColorGradeShadowLum>\n");
        xmp.append("      <crs:ColorGradeMidtoneLum>0</crs:ColorGradeMidtoneLum>\n");
        xmp.append("      <crs:ColorGradeHighlightLum>0</crs:ColorGradeHighlightLum>\n");
        xmp.append("      <crs:ColorGradeBlending>50</crs:ColorGradeBlending>\n");
        xmp.append("      <crs:ColorGradeGlobalHue>0</crs:ColorGradeGlobalHue>\n");
        xmp.append("      <crs:ColorGradeGlobalSat>0</crs:ColorGradeGlobalSat>\n");
        xmp.append("      <crs:ColorGradeGlobalLum>0</crs:ColorGradeGlobalLum>\n");
        
        // Lens corrections
        xmp.append("      <crs:LensProfileEnable>1</crs:LensProfileEnable>\n");
        xmp.append("      <crs:LensManualDistortionAmount>0</crs:LensManualDistortionAmount>\n");
        xmp.append("      <crs:VignetteAmount>0</crs:VignetteAmount>\n");
        xmp.append("      <crs:DefringePurpleAmount>0</crs:DefringePurpleAmount>\n");
        xmp.append("      <crs:DefringeGreenAmount>0</crs:DefringeGreenAmount>\n");
        
        // Sharpening and noise reduction
        xmp.append("      <crs:SharpenRadius>1.0</crs:SharpenRadius>\n");
        xmp.append("      <crs:SharpenDetail>25</crs:SharpenDetail>\n");
        xmp.append("      <crs:SharpenEdgeMasking>0</crs:SharpenEdgeMasking>\n");
        xmp.append("      <crs:PostCropVignettingAmount>0</crs:PostCropVignettingAmount>\n");
        xmp.append("      <crs:GrainAmount>0</crs:GrainAmount>\n");
        xmp.append("      <crs:ColorNoiseReductionDetail>50</crs:ColorNoiseReductionDetail>\n");
        xmp.append("      <crs:ColorNoiseReductionSmoothness>50</crs:ColorNoiseReductionSmoothness>\n");
        xmp.append("      <crs:LuminanceSmoothing>0</crs:LuminanceSmoothing>\n");
        
        // Transform settings
        xmp.append("      <crs:PerspectiveUpright>0</crs:PerspectiveUpright>\n");
        xmp.append("      <crs:PerspectiveVertical>0</crs:PerspectiveVertical>\n");
        xmp.append("      <crs:PerspectiveHorizontal>0</crs:PerspectiveHorizontal>\n");
        xmp.append("      <crs:PerspectiveRotate>0.0</crs:PerspectiveRotate>\n");
        xmp.append("      <crs:PerspectiveAspect>0</crs:PerspectiveAspect>\n");
        xmp.append("      <crs:PerspectiveScale>100</crs:PerspectiveScale>\n");
        xmp.append("      <crs:PerspectiveX>0.00</crs:PerspectiveX>\n");
        xmp.append("      <crs:PerspectiveY>0.00</crs:PerspectiveY>\n");
        
        // Calibration - use extracted color space and profile information
        String cameraProfile = determineCameraProfile(metadata);
        xmp.append("      <crs:CameraProfile>").append(escapeXml(cameraProfile)).append("</crs:CameraProfile>\n");
        
        // Generate profile digest based on actual camera and profile
        String profileDigest = generateProfileDigest(metadata.getCameraMake(), metadata.getCameraModel(), cameraProfile);
        xmp.append("      <crs:CameraProfileDigest>").append(profileDigest).append("</crs:CameraProfileDigest>\n");
        
        // Add EXIF data
        if (metadata.getCameraMake() != null) {
            xmp.append("      <tiff:Make>").append(escapeXml(metadata.getCameraMake())).append("</tiff:Make>\n");
            xmp.append("      <exif:Make>").append(escapeXml(metadata.getCameraMake())).append("</exif:Make>\n");
        }
        if (metadata.getCameraModel() != null) {
            xmp.append("      <tiff:Model>").append(escapeXml(metadata.getCameraModel())).append("</tiff:Model>\n");
            xmp.append("      <exif:Model>").append(escapeXml(metadata.getCameraModel())).append("</exif:Model>\n");
        }
        if (metadata.getIso() != null) {
            xmp.append("      <exif:ISOSpeedRatings>\n");
            xmp.append("        <rdf:Seq>\n");
            xmp.append("          <rdf:li>").append(escapeXml(metadata.getIso())).append("</rdf:li>\n");
            xmp.append("        </rdf:Seq>\n");
            xmp.append("      </exif:ISOSpeedRatings>\n");
        }
        if (metadata.getAperture() != null) {
            String apertureValue = metadata.getAperture().replace("f/", "");
            xmp.append("      <exif:FNumber>").append(apertureValue).append("/1</exif:FNumber>\n");
            xmp.append("      <exif:ApertureValue>").append(calculateApertureValue(apertureValue)).append("/1</exif:ApertureValue>\n");
        }
        if (metadata.getShutterSpeed() != null) {
            xmp.append("      <exif:ExposureTime>").append(escapeXml(metadata.getShutterSpeed().replace("s", ""))).append("</exif:ExposureTime>\n");
        }
        if (metadata.getFocalLength() != null) {
            String focalLength = metadata.getFocalLength().replace(" mm", "");
            xmp.append("      <exif:FocalLength>").append(focalLength).append("/1</exif:FocalLength>\n");
        }
        if (metadata.getDateTimeTaken() != null) {
            String dateTime = metadata.getDateTimeTaken().toString().replace("T", " ");
            xmp.append("      <exif:DateTimeOriginal>").append(dateTime).append("</exif:DateTimeOriginal>\n");
            xmp.append("      <exif:DateTimeDigitized>").append(dateTime).append("</exif:DateTimeDigitized>\n");
            xmp.append("      <xmp:CreateDate>").append(metadata.getDateTimeTaken()).append("</xmp:CreateDate>\n");
            xmp.append("      <xmp:ModifyDate>").append(LocalDateTime.now()).append("</xmp:ModifyDate>\n");
        }
        if (metadata.getWidth() != null) {
            xmp.append("      <exif:PixelXDimension>").append(metadata.getWidth()).append("</exif:PixelXDimension>\n");
            xmp.append("      <tiff:ImageWidth>").append(metadata.getWidth()).append("</tiff:ImageWidth>\n");
        }
        if (metadata.getHeight() != null) {
            xmp.append("      <exif:PixelYDimension>").append(metadata.getHeight()).append("</exif:PixelYDimension>\n");
            xmp.append("      <tiff:ImageLength>").append(metadata.getHeight()).append("</tiff:ImageLength>\n");
        }
        if (metadata.getLensModel() != null) {
            xmp.append("      <aux:Lens>").append(escapeXml(metadata.getLensModel())).append("</aux:Lens>\n");
            xmp.append("      <exifEX:LensModel>").append(escapeXml(metadata.getLensModel())).append("</exifEX:LensModel>\n");
        }
        
        // GPS data
        if (metadata.getLatitude() != null) {
            xmp.append("      <exif:GPSLatitude>").append(formatGpsCoordinate(metadata.getLatitude())).append("</exif:GPSLatitude>\n");
            if (metadata.getGpsLatitudeRef() != null) {
                xmp.append("      <exif:GPSLatitudeRef>").append(metadata.getGpsLatitudeRef()).append("</exif:GPSLatitudeRef>\n");
            }
        }
        if (metadata.getLongitude() != null) {
            xmp.append("      <exif:GPSLongitude>").append(formatGpsCoordinate(metadata.getLongitude())).append("</exif:GPSLongitude>\n");
            if (metadata.getGpsLongitudeRef() != null) {
                xmp.append("      <exif:GPSLongitudeRef>").append(metadata.getGpsLongitudeRef()).append("</exif:GPSLongitudeRef>\n");
            }
        }
        if (metadata.getAltitude() != null) {
            xmp.append("      <exif:GPSAltitude>").append(String.format("%.2f/1", metadata.getAltitude())).append("</exif:GPSAltitude>\n");
            xmp.append("      <exif:GPSAltitudeRef>0</exif:GPSAltitudeRef>\n");
        }
        
        // Metadata information
        xmp.append("      <xmp:CreatorTool>Karthi's Meta Data Extractor</xmp:CreatorTool>\n");
        xmp.append("      <xmp:MetadataDate>").append(LocalDateTime.now()).append("</xmp:MetadataDate>\n");
        xmp.append("      <dc:format>").append(metadata.getMimeType()).append("</dc:format>\n");
        
        // Photoshop settings
        xmp.append("      <photoshop:ColorMode>3</photoshop:ColorMode>\n");
        xmp.append("      <photoshop:ICCProfile>sRGB IEC61966-2.1</photoshop:ICCProfile>\n");
        
        xmp.append("    </rdf:Description>\n");
        xmp.append("  </rdf:RDF>\n");
        xmp.append("</x:xmpmeta>\n");
        xmp.append("<?xpacket end=\"w\"?>");
        
        return xmp.toString();
    }

    private String generateTextContent(ImageMetadataDto metadata) {
        StringBuilder text = new StringBuilder();
        text.append("IMAGE METADATA REPORT\n");
        text.append("Generated: ").append(metadata.getProcessedDateTime()).append("\n");
        text.append("=".repeat(50)).append("\n\n");
        
        // File Information
        text.append("FILE INFORMATION:\n");
        text.append("File Name: ").append(metadata.getFileName()).append("\n");
        text.append("File Size: ").append(formatFileSize(metadata.getFileSize())).append("\n");
        text.append("MIME Type: ").append(metadata.getMimeType()).append("\n");
        if (metadata.getWidth() != null && metadata.getHeight() != null) {
            text.append("Dimensions: ").append(metadata.getWidth()).append(" x ").append(metadata.getHeight()).append(" pixels\n");
        }
        if (metadata.getColorSpace() != null) {
            text.append("Color Space: ").append(metadata.getColorSpace()).append("\n");
        }
        if (metadata.getBitDepth() != null) {
            text.append("Bit Depth: ").append(metadata.getBitDepth()).append(" bits\n");
        }
        text.append("\n");
        
        // Camera Information
        text.append("CAMERA INFORMATION:\n");
        if (metadata.getCameraMake() != null) text.append("Make: ").append(metadata.getCameraMake()).append("\n");
        if (metadata.getCameraModel() != null) text.append("Model: ").append(metadata.getCameraModel()).append("\n");
        if (metadata.getLensModel() != null) text.append("Lens: ").append(metadata.getLensModel()).append("\n");
        if (metadata.getDateTimeTaken() != null) text.append("Date Taken: ").append(metadata.getDateTimeTaken()).append("\n");
        text.append("\n");
        
        // Camera Settings
        text.append("CAMERA SETTINGS:\n");
        if (metadata.getIso() != null) text.append("ISO: ").append(metadata.getIso()).append("\n");
        if (metadata.getAperture() != null) text.append("Aperture: ").append(metadata.getAperture()).append("\n");
        if (metadata.getShutterSpeed() != null) text.append("Shutter Speed: ").append(metadata.getShutterSpeed()).append("\n");
        if (metadata.getFocalLength() != null) text.append("Focal Length: ").append(metadata.getFocalLength()).append("\n");
        if (metadata.getExposureMode() != null) text.append("Exposure Mode: ").append(metadata.getExposureMode()).append("\n");
        if (metadata.getWhiteBalance() != null) text.append("White Balance: ").append(metadata.getWhiteBalance()).append("\n");
        if (metadata.getFlash() != null) text.append("Flash: ").append(metadata.getFlash()).append("\n");
        text.append("\n");
        
        // GPS Information
        if (metadata.getLatitude() != null || metadata.getLongitude() != null) {
            text.append("GPS INFORMATION:\n");
            if (metadata.getLatitude() != null) {
                text.append("Latitude: ").append(metadata.getLatitude()).append("°");
                if (metadata.getGpsLatitudeRef() != null) {
                    text.append(" ").append(metadata.getGpsLatitudeRef());
                }
                text.append("\n");
            }
            if (metadata.getLongitude() != null) {
                text.append("Longitude: ").append(metadata.getLongitude()).append("°");
                if (metadata.getGpsLongitudeRef() != null) {
                    text.append(" ").append(metadata.getGpsLongitudeRef());
                }
                text.append("\n");
            }
            if (metadata.getAltitude() != null) {
                text.append("Altitude: ").append(metadata.getAltitude()).append(" m\n");
            }
            text.append("\n");
        }
        
        // Additional metadata (for debugging)
        if (metadata.getAdditionalMetadata() != null && !metadata.getAdditionalMetadata().isEmpty()) {
            text.append("ADDITIONAL METADATA:\n");
            metadata.getAdditionalMetadata().entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .forEach(entry -> text.append(entry.getKey()).append(": ").append(entry.getValue()).append("\n"));
        }
        
        return text.toString();
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null) return "Unknown";
        
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.2f %s", size, units[unitIndex]);
    }

    private String escapeXml(String str) {
        if (str == null) return "";
        return str.replace("&", "&amp;")
                  .replace("<", "&lt;")
                  .replace(">", "&gt;")
                  .replace("\"", "&quot;")
                  .replace("'", "&apos;");
    }

    private String formatGpsCoordinate(Double coordinate) {
        if (coordinate == null) return "0/1,0/1,0/1";
        
        double absCoordinate = Math.abs(coordinate);
        int degrees = (int) absCoordinate;
        double minutesFloat = (absCoordinate - degrees) * 60;
        int minutes = (int) minutesFloat;
        double seconds = (minutesFloat - minutes) * 60;
        
        return String.format("%d/1,%d/1,%.0f/1", degrees, minutes, seconds);
    }
    
    private String calculateApertureValue(String apertureStr) {
        try {
            double aperture = Double.parseDouble(apertureStr);
            // APEX aperture value = 2 * log2(f-number)
            double apexValue = 2 * (Math.log(aperture) / Math.log(2));
            return String.format("%.0f", apexValue * 100);
        } catch (NumberFormatException e) {
            return "0";
        }
    }
    
    private String mapContrastToLightroom(String contrast) {
        if (contrast == null) return "0";
        
        String lowerContrast = contrast.toLowerCase();
        if (lowerContrast.contains("low") || lowerContrast.contains("soft")) {
            return "-25";
        } else if (lowerContrast.contains("high") || lowerContrast.contains("hard")) {
            return "+25";
        } else if (lowerContrast.contains("normal") || lowerContrast.contains("standard")) {
            return "0";
        }
        
        // Try to extract numeric value
        try {
            if (contrast.matches(".*\\d+.*")) {
                String numStr = contrast.replaceAll("[^-\\d]", "");
                int value = Integer.parseInt(numStr);
                // Scale to Lightroom range (-100 to +100)
                return String.valueOf(Math.max(-100, Math.min(100, value * 25)));
            }
        } catch (NumberFormatException e) {
            // Continue with default
        }
        
        return "0";
    }
    
    private String mapSaturationToLightroom(String saturation) {
        if (saturation == null) return "0";
        
        String lowerSaturation = saturation.toLowerCase();
        if (lowerSaturation.contains("low") || lowerSaturation.contains("muted")) {
            return "-25";
        } else if (lowerSaturation.contains("high") || lowerSaturation.contains("vivid")) {
            return "+25";
        } else if (lowerSaturation.contains("normal") || lowerSaturation.contains("standard")) {
            return "0";
        }
        
        // Try to extract numeric value
        try {
            if (saturation.matches(".*\\d+.*")) {
                String numStr = saturation.replaceAll("[^-\\d]", "");
                int value = Integer.parseInt(numStr);
                // Scale to Lightroom range (-100 to +100)
                return String.valueOf(Math.max(-100, Math.min(100, value * 25)));
            }
        } catch (NumberFormatException e) {
            // Continue with default
        }
        
        return "0";
    }
    
    private String mapSharpnessToClarity(String sharpness) {
        if (sharpness == null) return "0";
        
        String lowerSharpness = sharpness.toLowerCase();
        if (lowerSharpness.contains("low") || lowerSharpness.contains("soft")) {
            return "-15";
        } else if (lowerSharpness.contains("high") || lowerSharpness.contains("hard")) {
            return "+15";
        } else if (lowerSharpness.contains("normal") || lowerSharpness.contains("standard")) {
            return "0";
        }
        
        // Try to extract numeric value
        try {
            if (sharpness.matches(".*\\d+.*")) {
                String numStr = sharpness.replaceAll("[^-\\d]", "");
                int value = Integer.parseInt(numStr);
                // Scale to Lightroom clarity range (-100 to +100)
                return String.valueOf(Math.max(-100, Math.min(100, value * 15)));
            }
        } catch (NumberFormatException e) {
            // Continue with default
        }
        
        return "0";
    }
    
    private String determineCameraProfile(ImageMetadataDto metadata) {
        // Determine camera profile based on extracted metadata
        String cameraMake = metadata.getCameraMake();
        String pictureStyle = metadata.getPictureStyle();
        String colorSpace = metadata.getColorSpace();
        
        if (cameraMake != null) {
            String lowerMake = cameraMake.toLowerCase();
            
            // Canon profiles
            if (lowerMake.contains("canon")) {
                if (pictureStyle != null) {
                    String lowerStyle = pictureStyle.toLowerCase();
                    if (lowerStyle.contains("neutral")) return "Camera Neutral";
                    if (lowerStyle.contains("portrait")) return "Camera Portrait";
                    if (lowerStyle.contains("landscape")) return "Camera Landscape";
                    if (lowerStyle.contains("vivid")) return "Camera Vivid";
                }
                return "Camera Standard";
            }
            
            // Nikon profiles
            else if (lowerMake.contains("nikon")) {
                if (pictureStyle != null) {
                    String lowerStyle = pictureStyle.toLowerCase();
                    if (lowerStyle.contains("neutral")) return "Camera Neutral";
                    if (lowerStyle.contains("portrait")) return "Camera Portrait";
                    if (lowerStyle.contains("landscape")) return "Camera Landscape";
                    if (lowerStyle.contains("vivid")) return "Camera Vivid";
                }
                return "Camera Standard";
            }
            
            // Sony profiles
            else if (lowerMake.contains("sony")) {
                if (pictureStyle != null) {
                    String lowerStyle = pictureStyle.toLowerCase();
                    if (lowerStyle.contains("neutral")) return "Camera Neutral";
                    if (lowerStyle.contains("portrait")) return "Camera Portrait";
                    if (lowerStyle.contains("landscape")) return "Camera Landscape";
                    if (lowerStyle.contains("vivid")) return "Camera Vivid";
                }
                return "Camera Standard";
            }
        }
        
        // Fallback based on color space
        if ("Adobe RGB".equals(colorSpace)) {
            return "Adobe Standard";
        } else if ("sRGB".equals(colorSpace)) {
            return "Adobe Standard";
        }
        
        return "Adobe Standard";
    }
    
    private String generateProfileDigest(String make, String model, String profile) {
        // Generate a consistent digest based on camera make, model, and profile
        String input = (make != null ? make : "") + (model != null ? model : "") + profile;
        
        // Simple hash-like digest generation (in real implementation, you'd use proper hashing)
        int hash = input.hashCode();
        if (hash < 0) hash = -hash;
        
        // Convert to hex string with fixed length
        String hexString = Integer.toHexString(hash).toUpperCase();
        while (hexString.length() < 8) {
            hexString = "0" + hexString;
        }
        
        // Create a 32-character digest (like Adobe uses)
        StringBuilder digest = new StringBuilder();
        for (int i = 0; i < 4; i++) {
            digest.append(hexString);
        }
        
        return digest.toString().substring(0, 32);
    }

    private void createDirectoriesIfNotExist() {
        File uploadDir = new File(UPLOAD_DIR);
        File xmpDir = new File(XMP_DIR);
        File textDir = new File(TEXT_DIR);
        
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        if (!xmpDir.exists()) {
            xmpDir.mkdirs();
        }
        if (!textDir.exists()) {
            textDir.mkdirs();
        }
    }
}