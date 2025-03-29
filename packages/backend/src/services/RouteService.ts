import { RouteRepository } from '../repositories/RouteRepository';
import { Route } from '../domain/entities/Route';
import { Logger } from '../utils/Logger';

export class RouteService {
    private routeRepository: RouteRepository;
    private logger: Logger;

    constructor(routeRepository: RouteRepository, logger: Logger) {
        this.routeRepository = routeRepository;
    }

    async findAll(): Promise<Route[]> {
        try {
            return await this.routeRepository.findAll();
        } catch (error) {
            this.logger.error('[RouteService](findAll) Error in find all routes service', error);
            throw error;
        }
    }
}