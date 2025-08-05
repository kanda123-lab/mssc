package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.ImageMetadataDto;
import org.springframework.web.multipart.MultipartFile;

public interface ImageMetadataService {
    ImageMetadataDto extractMetadata(MultipartFile file) throws Exception;
    String generateXmpFile(ImageMetadataDto metadata) throws Exception;
    String generateTextFile(ImageMetadataDto metadata) throws Exception;
}