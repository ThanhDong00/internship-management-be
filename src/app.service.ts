import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  @Cron('0 */15 * * * *')
  handleCron() {
    console.log('Cron job executed to prevent render shutdown');
  }
}
