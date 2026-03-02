export class PlayerViewDto {
  id: string;
  login: string;

  static map(user): PlayerViewDto {
    const dto = new PlayerViewDto();
    dto.id = user.id;
    dto.login = user.login;
    return dto;
  }
}
