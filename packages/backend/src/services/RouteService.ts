import { RouteRepository } from '../repositories/RouteRepository';
import { Route } from '../domain/entities/Route';

export class RouteService {
    private routeRepository: RouteRepository;

    constructor(routeRepository: RouteRepository) {
        this.routeRepository = routeRepository;
    }
    
    async findAll(): Promise<Route[]> {
        return await this.routeRepository.findAll();
    }
}