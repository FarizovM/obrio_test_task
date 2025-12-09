import { Injectable, Inject } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../user.entity';
import { CreateUserDto } from '../dto/user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        @Inject('NOTIFICATION_SERVICE') private client: ClientProxy,
        @InjectMetric('users_registered_total') public counter: Counter<string>,
    ) { }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create(createUserDto);
        const savedUser = await this.usersRepository.save(user);

        // Відправляємо подію (Event), результат нам не важливий
        this.client.emit('user_created', savedUser);
        this.counter.inc(); //збільшуємо лічильник метрики
        return savedUser;
    }
}