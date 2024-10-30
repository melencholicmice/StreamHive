import { TimestampMixin } from "src/core/timestampMixin";
import { Column, PrimaryGeneratedColumn ,BeforeInsert, BeforeUpdate, Entity } from "typeorm";
import { genSalt , hash, compare} from 'bcrypt';

@Entity()
export class User extends TimestampMixin {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({unique: true})
    username: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    private async hashPassword() {
        const salt = await genSalt();
        this.password = await hash(this.password, salt);
    }

    async comparePassword(password: string): Promise<boolean> {
        return await compare(password, this.password);
    }

    @BeforeInsert()
    @BeforeUpdate()
    async beforeSave() {
        if (this.password) {
            await this.hashPassword();
        }
    }
}
