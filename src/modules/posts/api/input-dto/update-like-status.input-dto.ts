import { IsEnum } from 'class-validator';


export class UpdateLikeStatusDto {
  @IsEnum(['None', 'Like', 'Dislike'], { message: 'likeStatus must be None, Like or Dislike' })
  likeStatus: 'None' | 'Like' | 'Dislike';
}
