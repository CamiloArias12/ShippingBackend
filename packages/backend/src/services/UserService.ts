import bcrypt from 'bcrypt';
import { User } from '../domain/entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { JwtService } from '../utils/Jwt';
import { MailerService } from '../infrastructure/email/email';
import { UserCreateDto } from '@shipping/shared/user';
import { Logger } from '../utils/Logger';

export class UserService {
    private userRepository: UserRepository;
    private jwtService: JwtService;
    private mailerService: MailerService
    private logger: Logger;

    constructor(jwtService: JwtService, userRepository: UserRepository, mailerService: MailerService,logger: Logger) {
        this.logger = logger;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }

    async create(user: UserCreateDto): Promise<{ token: string } | null> {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const result: User = await this.userRepository.create({
                ...user,
                password: hashedPassword,
                created_at: new Date(),
            });
            if (!result) return null;
            
            this.mailerService.sendWelcomeEmail(user.email, user.name);
            return await this.login(user.email, user.password);
        } catch (error) {
            this.logger.error('[UserService](create) Error in create user', error);
            throw error;
        }
    }

    async login(email: string, password: string): Promise<{ token: string } | null> {
        try {
            const user = await this.userRepository.findByEmail(email);
            if (!user) return null;
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return null;
            const token = this.jwtService.generateToken({ id: user.id, email: user.email, role: user.role });
            return { token };
        } catch (error) {
            this.logger.error('[UserService](login) Error in login service', error);
            throw error;
        }
    }

    async find(id: number): Promise<User | null> {
        try {
            return await this.userRepository.findById(id);
        } catch (error) {
            this.logger.error('[UserService](find) Error in  find user', error);
            throw error;
        }
    }

}