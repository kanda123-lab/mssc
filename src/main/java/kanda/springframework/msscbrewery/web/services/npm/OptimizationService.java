package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.OptimizationSuggestion;
import reactor.core.publisher.Mono;

import java.util.List;

public interface OptimizationService {
    Mono<List<OptimizationSuggestion>> generateSuggestions(String packageName, String version);
}