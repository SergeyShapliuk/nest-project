import { IsEnum, IsNotEmpty } from 'class-validator';


export class UpdateLikeStatusDto {
  @IsNotEmpty({ message: 'likeStatus is required' })
  @IsEnum(['None', 'Like', 'Dislike'], { message: 'likeStatus must be None, Like or Dislike' })
  likeStatus: 'None' | 'Like' | 'Dislike';
}
