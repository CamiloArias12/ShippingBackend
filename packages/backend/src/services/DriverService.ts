import { DriverRepository } from 'src/repositories/DriverRepository';
import { Driver } from 'src/domain/entities/Driver';
import { Logger } from '../utils/Logger';
import { UserService } from './UserService';

export class DriverService {
    private driverRepository: DriverRepository;
    private userService: UserService;
    private logger: Logger;

    constructor(driverRepository: DriverRepository, userService: UserService, logger: Logger) {
        this.logger = logger;
        this.driverRepository = driverRepository;
        this.userService = userService;
    }

    async findAll(): Promise<Driver[]> {
        try {
            const drivers = await this.driverRepository.findAll();
            for (const driver of drivers) {
                const user = await this.userService.find(driver.user_id);
                if (user) {
                    driver.user = user;
                }
            }
            return drivers;
        } catch (error) {
            this.logger.error('[DriverService](findAll) Error in find all drivers', error);
            throw error;
        }
    }

    async find(id: number): Promise<Driver | null> {
        try {
            const driver = await this.driverRepository.findById(id);

            driver.user = await this.userService.find(driver.user_id);
            return driver;
        } catch (error) {
            this.logger.error('[DriverService](find) Error in find driver', error);
            throw error;
        }
    }
}