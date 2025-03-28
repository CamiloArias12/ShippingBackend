import bcrypt from 'bcrypt';
import { User } from '../domain/entities/User';
import { UserRepository } from 'src/repositories/UserRepository';
import { JwtService } from 'src/utils/Jwt';
import { MailerService } from 'src/infratructure/email/email';

export class UserService {
    private userRepository: UserRepository;
    private jwtService: JwtService;
    private mailerService:MailerService

    constructor(jwtService: JwtService, userRepository: UserRepository, mailerService:MailerService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.mailerService=mailerService;
    }

    async create(user: User): Promise<User> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return await this.userRepository.create({
            ...user,
            password: hashedPassword,
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    async login(email: string, password: string): Promise<{ user: User, token: string } | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        const token = this.jwtService.generateToken({ id: user.id, email: user.email, role: user.role });
        return { user, token };
    }

    async find(id: number): Promise<User | null> {
        return await this.userRepository.findById(id);
    }
}