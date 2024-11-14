import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class TimestampMixin {
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

export type TimeStampType = {
  createdAt: Date;
  updatedAt: Date;
};
