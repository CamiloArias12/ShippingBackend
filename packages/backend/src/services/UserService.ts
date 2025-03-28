import bcrypt from 'bcrypt';
import { User } from '../domain/entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { JwtService } from '../utils/Jwt';
import { MailerService } from '../infrastructure/email/email';
import { UserCreateDto } from '@shipping/shared/user';

export class UserService {
    private userRepository: UserRepository;
    private jwtService: JwtService;
    private mailerService: MailerService

    constructor(jwtService: JwtService, userRepository: UserRepository, mailerService: MailerService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
    }

    async create(user: UserCreateDto): Promise<{ token: string } | null> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const result: User = await this.userRepository.create({
            ...user,
            password: hashedPassword,
            created_at: new Date(),
        });
        if (!result) return null;

        this.mailerService.sendWelcomeEmail(user.email, user.name);
        return this.login(user.email, user.password)
    }

    async login(email: string, password: string): Promise<{ token: string } | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        const token = this.jwtService.generateToken({ id: user.id, email: user.email, role: user.role });
        return { token };
    }

    async find(id: number): Promise<User | null> {
        return await this.userRepository.findById(id);
    }

}