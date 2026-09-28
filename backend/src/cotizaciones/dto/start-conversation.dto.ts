import { IsUUID } from 'class-validator';

export class StartConversationDto {
  @IsUUID()
  emprendedorId: string;
}
