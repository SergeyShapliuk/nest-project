import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

// Доступные декораторы для валидации
// https://github.com/typestack/class-validator?tab=readme-ov-file#validation-decorators

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CodeInputDto {
  @IsNotEmpty()
  @IsString()
  @Trim()
  code: string;

}
