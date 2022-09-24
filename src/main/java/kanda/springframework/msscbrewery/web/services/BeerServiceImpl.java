package kanda.springframework.msscbrewery.web.services;

import kanda.springframework.msscbrewery.web.model.BeerDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
public class BeerServiceImpl implements BeerService {
    @Override
    public BeerDto getBeerById(UUID beerId) {
    return BeerDto.builder().id(UUID.randomUUID()).beerName("king fisher").beerStyle("Pale Ale").build();
    }

    @Override
    public BeerDto saveBeerName(BeerDto beerDto) {
        return BeerDto
                .builder()
                .id(UUID.randomUUID()).build();
    }

    @Override
    public void updateBeer(UUID beerId, BeerDto beerDto) {

    }

    @Override
    public void deleteById(UUID beerId) {
     log.debug("delete a beer");
    }
}
