import { DriverRepository } from 'src/repositories/DriverRepository';
import { Driver } from 'src/domain/entities/Driver';
import { Logger } from '../utils/Logger';

export class DriverService {
    private driverRepository: DriverRepository;
    private logger: Logger;

    constructor(driverRepository: DriverRepository, logger: Logger) {
        this.logger = logger;
        this.driverRepository = driverRepository;
    }

    async findAll(): Promise<Driver[]> {
        try {
            return await this.driverRepository.findAll();
        } catch (error) {
            this.logger.error('[DriverService](findAll) Error in find all drivers', error);
            throw error;
        }
    }
}