import { Controller, Get } from '@nestjs/common';
import { PiecesService } from './pieces.service';
import type{ Piece } from './piece.entity';

@Controller('pieces')
export class PiecesController {
  constructor(private readonly piecesService: PiecesService) {}

  @Get()
  findAll(): Piece[] {
    return this.piecesService.findAll();
  }
}