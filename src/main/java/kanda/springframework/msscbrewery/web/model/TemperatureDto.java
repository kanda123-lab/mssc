package kanda.springframework.msscbrewery.web.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemperatureDto {

    private Double temperature;
    private String unit;
    private String location;
    private LocalDateTime timestamp;
    private String timeOfDay; // "Morning", "Day", "Evening", "Night"
    private Integer aqi; // Air Quality Index (0-500)
    private String aqiCategory; // "Good", "Moderate", "Unhealthy for Sensitive Groups", etc.
    private String aqiDescription; // Detailed description of air quality

}