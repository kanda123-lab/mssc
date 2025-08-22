package kanda.springframework.msscbrewery.web.services.npm;

import kanda.springframework.msscbrewery.web.model.npm.DependencyNode;
import reactor.core.publisher.Mono;

public interface DependencyTreeService {
    Mono<DependencyNode> buildDependencyTree(String packageName, String version);
}