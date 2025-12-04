export class CreatePostLikeDomainDto {
  userId: string;
  login: string;
  postId: string;
  status: 'Like' | 'Dislike' | 'None';
}
