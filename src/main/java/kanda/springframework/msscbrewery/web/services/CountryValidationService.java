package kanda.springframework.msscbrewery.web.services;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class CountryValidationService {

    private static final Set<String> VALID_COUNTRIES = new HashSet<>(Arrays.asList(
        // Major countries and cities
        "afghanistan", "albania", "algeria", "argentina", "armenia", "australia", "austria", "azerbaijan",
        "bangladesh", "belarus", "belgium", "bolivia", "brazil", "bulgaria",
        "cambodia", "cameroon", "canada", "chile", "china", "colombia", "croatia", "cuba", "cyprus", "czech republic",
        "denmark", "dominican republic", "ecuador", "egypt", "estonia", "ethiopia",
        "finland", "france", "georgia", "germany", "ghana", "greece", "guatemala",
        "haiti", "honduras", "hungary", "iceland", "india", "indonesia", "iran", "iraq", "ireland", "israel", "italy",
        "jamaica", "japan", "jordan", "kazakhstan", "kenya", "kuwait",
        "latvia", "lebanon", "libya", "lithuania", "luxembourg",
        "madagascar", "malaysia", "maldives", "malta", "mexico", "moldova", "mongolia", "morocco",
        "nepal", "netherlands", "new zealand", "nicaragua", "nigeria", "norway",
        "pakistan", "panama", "peru", "philippines", "poland", "portugal",
        "qatar", "romania", "russia", "saudi arabia", "senegal", "serbia", "singapore", "slovakia", "slovenia", "south africa", "south korea", "spain", "sri lanka", "sweden", "switzerland",
        "taiwan", "thailand", "tunisia", "turkey", "ukraine", "united arab emirates", "united kingdom", "united states", "uruguay", "uzbekistan", "venezuela", "vietnam", "yemen", "zimbabwe",
        
        // Major cities
        "london", "paris", "berlin", "madrid", "rome", "amsterdam", "vienna", "prague", "budapest", "warsaw",
        "moscow", "istanbul", "athens", "stockholm", "oslo", "copenhagen", "helsinki", "dublin", "lisbon",
        "tokyo", "beijing", "shanghai", "mumbai", "delhi", "bangalore", "chennai", "kolkata", "hyderabad", "pune",
        "new york", "los angeles", "chicago", "houston", "philadelphia", "phoenix", "san antonio", "san diego", "dallas", "san jose",
        "toronto", "vancouver", "montreal", "calgary", "ottawa", "sydney", "melbourne", "brisbane", "perth", "adelaide",
        "cairo", "cape town", "johannesburg", "lagos", "nairobi", "casablanca", "tunis", "algiers",
        "bangkok", "jakarta", "manila", "kuala lumpur", "singapore", "ho chi minh city", "hanoi",
        "seoul", "busan", "pyongyang", "taipei", "hong kong", "macau",
        "riyadh", "jeddah", "mecca", "medina", "dubai", "abu dhabi", "doha", "kuwait city", "manama",
        "tehran", "isfahan", "mashhad", "baghdad", "basra", "damascus", "aleppo", "beirut", "amman",
        "karachi", "lahore", "islamabad", "dhaka", "chittagong", "kathmandu", "colombo", "male",
        "mexico city", "guadalajara", "monterrey", "puebla", "tijuana", "leon", "juarez",
        "sao paulo", "rio de janeiro", "brasilia", "salvador", "fortaleza", "belo horizonte",
        "buenos aires", "cordoba", "rosario", "mendoza", "la plata", "santiago", "valparaiso",
        "lima", "arequipa", "trujillo", "bogota", "medellin", "cali", "barranquilla",
        "caracas", "maracaibo", "valencia", "barquisimeto", "quito", "guayaquil", "cuenca"
    ));

    public boolean isValidCountryOrCity(String location) {
        if (location == null || location.trim().isEmpty()) {
            return false;
        }
        
        String normalizedLocation = location.toLowerCase().trim();
        return VALID_COUNTRIES.contains(normalizedLocation);
    }
    
    public String getValidationMessage(String location) {
        if (location == null || location.trim().isEmpty()) {
            return "Location name cannot be empty";
        }
        
        if (!isValidCountryOrCity(location)) {
            return "Please enter a valid country or major city name";
        }
        
        return null; // Valid location
    }
}