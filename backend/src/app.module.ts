import { Module } from '@nestjs/common';
import { PiecesModule } from './pieces/pieces.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PiecesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
