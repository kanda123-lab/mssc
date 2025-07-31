package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.TemperatureDto;

public interface TemperatureService {
    TemperatureDto getCurrentTemperature();
    TemperatureDto getCurrentTemperature(String location);
}