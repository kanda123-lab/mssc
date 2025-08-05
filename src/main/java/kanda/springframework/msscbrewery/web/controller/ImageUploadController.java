package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.ImageMetadataDto;
import kanda.springframework.msscbrewery.web.model.ImageUploadResponse;
import kanda.springframework.msscbrewery.web.services.ImageMetadataService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/v1/images")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "file://", "null"})
public class ImageUploadController {

    private final ImageMetadataService imageMetadataService;

    public ImageUploadController(ImageMetadataService imageMetadataService) {
        this.imageMetadataService = imageMetadataService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ImageUploadResponse.builder()
                                .success(false)
                                .message("Please select a file to upload")
                                .build());
            }

            // Check if it's an image file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(ImageUploadResponse.builder()
                                .success(false)
                                .message("Please upload a valid image file")
                                .build());
            }

            // Extract metadata
            ImageMetadataDto metadata = imageMetadataService.extractMetadata(file);

            // Generate XMP and text files
            String xmpFilePath = imageMetadataService.generateXmpFile(metadata);
            String textFilePath = imageMetadataService.generateTextFile(metadata);

            // Update metadata with file paths
            metadata.setXmpFilePath(xmpFilePath);
            metadata.setTextFilePath(textFilePath);

            // Build response
            ImageUploadResponse response = ImageUploadResponse.builder()
                    .success(true)
                    .message("Image processed successfully")
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .metadata(metadata)
                    .xmpDownloadUrl("/api/v1/images/download/xmp/" + getFileNameWithoutExtension(file.getOriginalFilename()) + ".xmp")
                    .textDownloadUrl("/api/v1/images/download/text/" + getFileNameWithoutExtension(file.getOriginalFilename()) + "_metadata.txt")
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ImageUploadResponse.builder()
                            .success(false)
                            .message("Error processing image: " + e.getMessage())
                            .build());
        }
    }

    @GetMapping("/download/xmp/{fileName}")
    public ResponseEntity<Resource> downloadXmpFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("xmp", fileName);
            Resource resource = new FileSystemResource(filePath);

            if (resource.exists() && resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
                headers.add(HttpHeaders.CONTENT_TYPE, "application/rdf+xml");

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/text/{fileName}")
    public ResponseEntity<Resource> downloadTextFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("text", fileName);
            Resource resource = new FileSystemResource(filePath);

            if (resource.exists() && resource.isReadable()) {
                HttpHeaders headers = new HttpHeaders();
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");
                headers.add(HttpHeaders.CONTENT_TYPE, "text/plain");

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/metadata/{fileName}")
    public ResponseEntity<String> getImageMetadata(@PathVariable String fileName) {
        // This endpoint could be used to retrieve previously processed metadata
        // For now, it returns a placeholder response
        return ResponseEntity.ok("Metadata retrieval endpoint for " + fileName + " - implementation depends on storage strategy");
    }

    private String getFileNameWithoutExtension(String fileName) {
        if (fileName == null || fileName.isEmpty()) {
            return fileName;
        }
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex == -1 ? fileName : fileName.substring(0, lastDotIndex);
    }
}