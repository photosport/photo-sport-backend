import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity('userphotosport')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'enum', enum: ['admin', 'client'], default: 'client' })
  role: string;
}
