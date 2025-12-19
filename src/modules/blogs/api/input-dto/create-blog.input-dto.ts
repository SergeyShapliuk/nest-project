import { IsEnum, IsString } from 'class-validator';
import { CreateBlogDto } from '../../dto/create-blog.dto';
// import { AgeRestriction } from '../../domain/blog.entity';


export class CreateBlogInputDto implements CreateBlogDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  websiteUrl: string;

  // @IsEnum(AgeRestriction)
  // ageRestriction: AgeRestriction;
}
