import { DriverRepository } from 'src/repositories/DriverRepository';
import { Driver } from 'src/domain/entities/Driver';

export class DriverService {
    private driverRepository: DriverRepository;

    constructor(driverRepository: DriverRepository) {
        this.driverRepository = driverRepository;
    }
    
    async findAll(): Promise<Driver[]> {
        return await this.driverRepository.findAll();
    }
}