package kanda.springframework.msscbrewery.web.services.npm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import kanda.springframework.msscbrewery.web.model.npm.PackageAnalysisDto;
import kanda.springframework.msscbrewery.web.model.npm.OptimizationSuggestion;
import kanda.springframework.msscbrewery.web.model.npm.SecurityVulnerability;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportingServiceImpl implements ReportingService {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<byte[]> generatePdfReport(PackageAnalysisDto analysis) {
        log.info("Generating PDF report for package: {}", analysis.getPackageName());
        
        return Mono.fromCallable(() -> {
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                Document document = new Document();
                PdfWriter.getInstance(document, baos);
                document.open();

                // Title
                Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
                Paragraph title = new Paragraph("NPM Package Analysis Report", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                document.add(title);
                document.add(new Paragraph(" "));

                // Package Info
                addPackageInfoSection(document, analysis);
                
                // Bundle Size
                if (analysis.getBundleSize() != null) {
                    addBundleSizeSection(document, analysis.getBundleSize());
                }
                
                // Security Info
                if (analysis.getSecurity() != null) {
                    addSecuritySection(document, analysis.getSecurity());
                }
                
                // Optimization Suggestions
                if (analysis.getOptimizations() != null && !analysis.getOptimizations().isEmpty()) {
                    addOptimizationSection(document, analysis.getOptimizations());
                }

                // Footer
                addFooter(document);

                document.close();
                return baos.toByteArray();
            }
        });
    }

    @Override
    public Mono<byte[]> generateCsvReport(List<PackageAnalysisDto> analyses) {
        log.info("Generating CSV report for {} packages", analyses.size());
        
        return Mono.fromCallable(() -> {
            try (StringWriter stringWriter = new StringWriter();
                 CSVWriter csvWriter = new CSVWriter(stringWriter)) {

                // Header
                String[] header = {
                    "Package Name", "Version", "Description", "License", "Bundle Size (KB)", 
                    "Gzipped Size (KB)", "Dependencies Count", "Vulnerabilities", "GitHub Stars",
                    "Weekly Downloads", "Quality Score"
                };
                csvWriter.writeNext(header);

                // Data
                for (PackageAnalysisDto analysis : analyses) {
                    String[] row = {
                        analysis.getPackageName() != null ? analysis.getPackageName() : "",
                        analysis.getVersion() != null ? analysis.getVersion() : "",
                        analysis.getDescription() != null ? analysis.getDescription() : "",
                        analysis.getLicense() != null ? analysis.getLicense() : "",
                        analysis.getBundleSize() != null ? String.valueOf(analysis.getBundleSize().getUncompressed() / 1024) : "0",
                        analysis.getBundleSize() != null ? String.valueOf(analysis.getBundleSize().getGzipped() / 1024) : "0",
                        analysis.getDependencies() != null ? String.valueOf(analysis.getDependencies().getDependenciesCount()) : "0",
                        analysis.getSecurity() != null ? String.valueOf(analysis.getSecurity().getVulnerabilityCount()) : "0",
                        analysis.getPopularity() != null ? String.valueOf(analysis.getPopularity().getGithubStars()) : "0",
                        analysis.getPopularity() != null ? String.valueOf(analysis.getPopularity().getWeeklyDownloads()) : "0",
                        analysis.getPopularity() != null ? String.valueOf(analysis.getPopularity().getQualityScore()) : "0"
                    };
                    csvWriter.writeNext(row);
                }

                return stringWriter.toString().getBytes();
            }
        });
    }

    @Override
    public Mono<String> generateJsonReport(PackageAnalysisDto analysis) {
        log.info("Generating JSON report for package: {}", analysis.getPackageName());
        
        return Mono.fromCallable(() -> objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(analysis));
    }

    @Override
    public Mono<byte[]> generateComparisonReport(Map<String, PackageAnalysisDto> comparison) {
        log.info("Generating comparison report for {} packages", comparison.size());
        
        return Mono.fromCallable(() -> {
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
                Document document = new Document();
                PdfWriter.getInstance(document, baos);
                document.open();

                // Title
                Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
                Paragraph title = new Paragraph("Package Comparison Report", titleFont);
                title.setAlignment(Element.ALIGN_CENTER);
                document.add(title);
                document.add(new Paragraph(" "));

                // Comparison Table
                PdfPTable table = new PdfPTable(comparison.size() + 1);
                table.setWidthPercentage(100);
                
                // Headers
                table.addCell("Metric");
                for (String packageName : comparison.keySet()) {
                    table.addCell(packageName);
                }
                
                // Bundle Size Row
                table.addCell("Bundle Size (KB)");
                for (PackageAnalysisDto analysis : comparison.values()) {
                    long size = analysis.getBundleSize() != null ? analysis.getBundleSize().getUncompressed() / 1024 : 0;
                    table.addCell(String.valueOf(size));
                }
                
                // Dependencies Count Row
                table.addCell("Dependencies");
                for (PackageAnalysisDto analysis : comparison.values()) {
                    int deps = analysis.getDependencies() != null ? analysis.getDependencies().getDependenciesCount() : 0;
                    table.addCell(String.valueOf(deps));
                }
                
                // Vulnerabilities Row
                table.addCell("Vulnerabilities");
                for (PackageAnalysisDto analysis : comparison.values()) {
                    int vulns = analysis.getSecurity() != null ? analysis.getSecurity().getVulnerabilityCount() : 0;
                    table.addCell(String.valueOf(vulns));
                }

                document.add(table);
                addFooter(document);
                document.close();
                
                return baos.toByteArray();
            }
        });
    }

    @Override
    public Mono<String> generateMarkdownReport(PackageAnalysisDto analysis) {
        log.info("Generating Markdown report for package: {}", analysis.getPackageName());
        
        return Mono.fromCallable(() -> {
            StringBuilder markdown = new StringBuilder();
            
            markdown.append("# NPM Package Analysis Report\n\n");
            markdown.append("**Package:** ").append(analysis.getPackageName()).append("@").append(analysis.getVersion()).append("\n");
            markdown.append("**Generated:** ").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n\n");
            
            // Basic Info
            markdown.append("## Package Information\n\n");
            if (analysis.getDescription() != null) {
                markdown.append("**Description:** ").append(analysis.getDescription()).append("\n");
            }
            if (analysis.getAuthor() != null) {
                markdown.append("**Author:** ").append(analysis.getAuthor()).append("\n");
            }
            if (analysis.getLicense() != null) {
                markdown.append("**License:** ").append(analysis.getLicense()).append("\n");
            }
            markdown.append("\n");
            
            // Bundle Size
            if (analysis.getBundleSize() != null) {
                markdown.append("## Bundle Size\n\n");
                markdown.append("- **Uncompressed:** ").append(formatBytes(analysis.getBundleSize().getUncompressed())).append("\n");
                markdown.append("- **Gzipped:** ").append(formatBytes(analysis.getBundleSize().getGzipped())).append("\n");
                markdown.append("- **Tree-shakable:** ").append(analysis.getBundleSize().isTreeshakable() ? "Yes" : "No").append("\n\n");
            }
            
            // Security
            if (analysis.getSecurity() != null) {
                markdown.append("## Security Analysis\n\n");
                markdown.append("- **Vulnerabilities:** ").append(analysis.getSecurity().getVulnerabilityCount()).append("\n");
                markdown.append("- **License Compatibility:** ").append(analysis.getSecurity().getLicenseCompatibility()).append("\n\n");
            }
            
            // Optimization Suggestions
            if (analysis.getOptimizations() != null && !analysis.getOptimizations().isEmpty()) {
                markdown.append("## Optimization Suggestions\n\n");
                for (OptimizationSuggestion suggestion : analysis.getOptimizations()) {
                    markdown.append("### ").append(suggestion.getTitle()).append("\n");
                    markdown.append(suggestion.getDescription()).append("\n");
                    markdown.append("**Impact:** ").append(suggestion.getImpact()).append("\n");
                    if (suggestion.getCodeExample() != null) {
                        markdown.append("```javascript\n").append(suggestion.getCodeExample()).append("\n```\n");
                    }
                    markdown.append("\n");
                }
            }
            
            return markdown.toString();
        });
    }

    private void addPackageInfoSection(Document document, PackageAnalysisDto analysis) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Paragraph section = new Paragraph("Package Information", sectionFont);
        document.add(section);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30f, 70f});
        
        addTableRow(table, "Name", analysis.getPackageName());
        addTableRow(table, "Version", analysis.getVersion());
        addTableRow(table, "Description", analysis.getDescription());
        addTableRow(table, "Author", analysis.getAuthor());
        addTableRow(table, "License", analysis.getLicense());
        addTableRow(table, "Homepage", analysis.getHomepage());
        
        document.add(table);
        document.add(new Paragraph(" "));
    }
    
    private void addBundleSizeSection(Document document, PackageAnalysisDto.BundleSizeInfo bundleSize) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Paragraph section = new Paragraph("Bundle Size Analysis", sectionFont);
        document.add(section);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{40f, 60f});
        
        addTableRow(table, "Uncompressed Size", formatBytes(bundleSize.getUncompressed()));
        addTableRow(table, "Gzipped Size", formatBytes(bundleSize.getGzipped()));
        addTableRow(table, "Tree-shakable", bundleSize.isTreeshakable() ? "Yes" : "No");
        
        document.add(table);
        document.add(new Paragraph(" "));
    }
    
    private void addSecuritySection(Document document, PackageAnalysisDto.SecurityInfo security) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Paragraph section = new Paragraph("Security Analysis", sectionFont);
        document.add(section);
        
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{40f, 60f});
        
        addTableRow(table, "Vulnerabilities", String.valueOf(security.getVulnerabilityCount()));
        addTableRow(table, "License Compatibility", security.getLicenseCompatibility());
        addTableRow(table, "Has Deprecated Dependencies", security.isHasDeprecatedDependencies() ? "Yes" : "No");
        
        document.add(table);
        document.add(new Paragraph(" "));
    }
    
    private void addOptimizationSection(Document document, List<OptimizationSuggestion> suggestions) throws DocumentException {
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD);
        Paragraph section = new Paragraph("Optimization Suggestions", sectionFont);
        document.add(section);
        
        for (OptimizationSuggestion suggestion : suggestions) {
            Font suggestionFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD);
            Paragraph suggestionTitle = new Paragraph(suggestion.getTitle(), suggestionFont);
            document.add(suggestionTitle);
            
            Paragraph description = new Paragraph(suggestion.getDescription());
            document.add(description);
            
            if (suggestion.getCodeExample() != null) {
                Font codeFont = new Font(Font.FontFamily.COURIER, 10);
                Paragraph code = new Paragraph(suggestion.getCodeExample(), codeFont);
                code.setIndentationLeft(20);
                document.add(code);
            }
            
            document.add(new Paragraph(" "));
        }
    }
    
    private void addFooter(Document document) throws DocumentException {
        Font footerFont = new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC);
        Paragraph footer = new Paragraph("Generated by NPM Package Analyzer - " + 
                LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }
    
    private void addTableRow(PdfPTable table, String key, String value) {
        table.addCell(key != null ? key : "");
        table.addCell(value != null ? value : "");
    }
    
    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
    }
}