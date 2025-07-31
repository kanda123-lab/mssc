package kanda.springframework.msscbrewery.web.controller;

import kanda.springframework.msscbrewery.web.model.TemperatureDto;
import kanda.springframework.msscbrewery.web.services.TemperatureService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/v1/temperature")
@RestController
public class TemperatureController {

    private final TemperatureService temperatureService;

    public TemperatureController(TemperatureService temperatureService) {
        this.temperatureService = temperatureService;
    }

    @GetMapping
    public ResponseEntity<TemperatureDto> getCurrentTemperature() {
        return new ResponseEntity<>(temperatureService.getCurrentTemperature(), HttpStatus.OK);
    }

    @GetMapping("/{location}")
    public ResponseEntity<?> getCurrentTemperature(@PathVariable("location") String location) {
        try {
            TemperatureDto temperature = temperatureService.getCurrentTemperature(location);
            return new ResponseEntity<>(temperature, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }
    
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
}