package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.TemperatureDto;
import kanda.springframework.msscbrewery.web.model.WeatherApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;

@Service
public class TemperatureServiceImpl implements TemperatureService {

    private final WebClient webClient;
    private final CountryValidationService countryValidationService;
    private final AirQualityService airQualityService;
    
    @Value("${weather.api.key:demo}")
    private String apiKey;

    public TemperatureServiceImpl(WebClient.Builder webClientBuilder, 
                                CountryValidationService countryValidationService,
                                AirQualityService airQualityService) {
        this.webClient = webClientBuilder.baseUrl("https://api.openweathermap.org").build();
        this.countryValidationService = countryValidationService;
        this.airQualityService = airQualityService;
    }

    @Override
    public TemperatureDto getCurrentTemperature() {
        return getCurrentTemperature("Delhi");
    }

    @Override
    public TemperatureDto getCurrentTemperature(String location) {
        // Validate country/city name
        String validationMessage = countryValidationService.getValidationMessage(location);
        if (validationMessage != null) {
            throw new IllegalArgumentException(validationMessage);
        }
        
        LocalDateTime now = LocalDateTime.now();
        String timeOfDay = getTimeOfDay(now);
        AirQualityService.AirQualityInfo aqiInfo = airQualityService.getAirQualityInfo(location);
        
        try {
            WeatherApiResponse response = webClient.get()
                    .uri("/data/2.5/weather?q={location}&appid={apiKey}&units=metric", location, apiKey)
                    .retrieve()
                    .bodyToMono(WeatherApiResponse.class)
                    .block();

            if (response != null && response.getMain() != null) {
                return TemperatureDto.builder()
                        .temperature(response.getMain().getTemp())
                        .unit("Celsius")
                        .location(response.getName())
                        .timestamp(now)
                        .timeOfDay(timeOfDay)
                        .aqi(aqiInfo.getAqi())
                        .aqiCategory(aqiInfo.getCategory())
                        .aqiDescription(aqiInfo.getDescription())
                        .build();
            }
        } catch (Exception e) {
            System.err.println("Error fetching weather data for " + location + ": " + e.getMessage());
        }

        double fallbackTemp = 20.0 + (Math.random() * 15.0);
        return TemperatureDto.builder()
                .temperature(Math.round(fallbackTemp * 100.0) / 100.0)
                .unit("Celsius")
                .location(location + " (simulated)")
                .timestamp(now)
                .timeOfDay(timeOfDay)
                .aqi(aqiInfo.getAqi())
                .aqiCategory(aqiInfo.getCategory())
                .aqiDescription(aqiInfo.getDescription())
                .build();
    }
    
    private String getTimeOfDay(LocalDateTime dateTime) {
        int hour = dateTime.getHour();
        if (hour >= 6 && hour < 12) {
            return "Morning";
        } else if (hour >= 12 && hour < 17) {
            return "Day";
        } else if (hour >= 17 && hour < 20) {
            return "Evening";
        } else {
            return "Night";
        }
    }
}