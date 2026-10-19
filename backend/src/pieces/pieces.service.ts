import { Injectable } from '@nestjs/common';
import { Piece } from './piece.entity';

@Injectable()
export class PiecesService {

  private readonly pieces = new Map<number, Piece>();
  private nextId = 1;

  findAll(): Piece[] {
    return Array.from(this.pieces.values());
  }
}