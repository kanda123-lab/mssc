package kanda.springframework.msscbrewery.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterAccess(Duration.ofMinutes(30))
                .expireAfterWrite(Duration.ofHours(2))
                .recordStats());
        
        // Define cache names
        cacheManager.setCacheNames(
                List.of("packageInfo",
                       "packageVersionInfo", 
                       "packageSearch",
                       "downloadStats",
                       "securityAdvisories",
                       "bundleInfo",
                       "packageVersions",
                       "githubInfo",
                       "similarPackages",
                       "packageDeprecation")
        );
        
        return cacheManager;
    }
}