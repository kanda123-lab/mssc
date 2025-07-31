package kanda.springframework.msscbrewery.web.services;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
public class AirQualityService {

    private final Random random = new Random();
    
    // Typical AQI ranges for different cities/countries
    private static final Map<String, int[]> CITY_AQI_RANGES = new HashMap<>();
    
    static {
        // Format: {min, max} AQI values for different locations
        CITY_AQI_RANGES.put("singapore", new int[]{15, 60});
        CITY_AQI_RANGES.put("tokyo", new int[]{20, 80});
        CITY_AQI_RANGES.put("london", new int[]{25, 75});
        CITY_AQI_RANGES.put("paris", new int[]{30, 90});
        CITY_AQI_RANGES.put("new york", new int[]{35, 95});
        CITY_AQI_RANGES.put("delhi", new int[]{150, 400});
        CITY_AQI_RANGES.put("mumbai", new int[]{120, 300});
        CITY_AQI_RANGES.put("beijing", new int[]{100, 250});
        CITY_AQI_RANGES.put("shanghai", new int[]{80, 180});
        CITY_AQI_RANGES.put("bangkok", new int[]{60, 150});
        CITY_AQI_RANGES.put("jakarta", new int[]{70, 160});
        CITY_AQI_RANGES.put("mexico city", new int[]{90, 180});
        CITY_AQI_RANGES.put("los angeles", new int[]{50, 120});
        CITY_AQI_RANGES.put("sydney", new int[]{20, 70});
        CITY_AQI_RANGES.put("melbourne", new int[]{25, 75});
        CITY_AQI_RANGES.put("cairo", new int[]{80, 200});
        CITY_AQI_RANGES.put("dubai", new int[]{40, 120});
        CITY_AQI_RANGES.put("riyadh", new int[]{50, 150});
        // Default range for other locations
        CITY_AQI_RANGES.put("default", new int[]{30, 100});
    }

    public AirQualityInfo getAirQualityInfo(String location) {
        String locationKey = location.toLowerCase().trim();
        
        // Remove "(simulated)" suffix if present
        locationKey = locationKey.replace(" (simulated)", "");
        
        // Get AQI range for the location
        int[] range = CITY_AQI_RANGES.getOrDefault(locationKey, CITY_AQI_RANGES.get("default"));
        
        // Generate random AQI within the range
        int aqi = range[0] + random.nextInt(range[1] - range[0] + 1);
        
        return new AirQualityInfo(aqi, getAqiCategory(aqi), getAqiDescription(aqi));
    }
    
    private String getAqiCategory(int aqi) {
        if (aqi <= 50) {
            return "Good";
        } else if (aqi <= 100) {
            return "Moderate";
        } else if (aqi <= 150) {
            return "Unhealthy for Sensitive Groups";
        } else if (aqi <= 200) {
            return "Unhealthy";
        } else if (aqi <= 300) {
            return "Very Unhealthy";
        } else {
            return "Hazardous";
        }
    }
    
    private String getAqiDescription(int aqi) {
        if (aqi <= 50) {
            return "Air quality is satisfactory, and air pollution poses little or no risk.";
        } else if (aqi <= 100) {
            return "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
        } else if (aqi <= 150) {
            return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
        } else if (aqi <= 200) {
            return "Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects.";
        } else if (aqi <= 300) {
            return "Health alert: The risk of health effects is increased for everyone.";
        } else {
            return "Health warning of emergency conditions: everyone is more likely to be affected.";
        }
    }
    
    public static class AirQualityInfo {
        private final int aqi;
        private final String category;
        private final String description;
        
        public AirQualityInfo(int aqi, String category, String description) {
            this.aqi = aqi;
            this.category = category;
            this.description = description;
        }
        
        public int getAqi() {
            return aqi;
        }
        
        public String getCategory() {
            return category;
        }
        
        public String getDescription() {
            return description;
        }
    }
}