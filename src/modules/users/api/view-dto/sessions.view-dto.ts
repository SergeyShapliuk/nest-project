import { Session } from '../../domain/session.entity';

export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(session: Session): SessionsViewDto {
    const dto = new SessionsViewDto();

    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.lastActiveDate.toISOString();
    dto.deviceId = session.deviceId;

    return dto;
  }
}
