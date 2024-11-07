import { Module } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import config from 'src/config/configuration';


@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [config.rabbitMq.url],
          queue: 'notification-queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [TranscoderService]
})
export class TranscoderModule {}
