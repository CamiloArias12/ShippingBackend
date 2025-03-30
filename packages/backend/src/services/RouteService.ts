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
    async find(id: number): Promise<Route | null> {
        try {
            return await this.routeRepository.findById(id);
        } catch (error) {
            this.logger.error('[RouteService](find) Error in find route service', error);
            throw error;
        }
    }
}