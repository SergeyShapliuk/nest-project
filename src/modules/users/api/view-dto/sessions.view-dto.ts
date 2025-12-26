import { SessionDocument } from '../../domain/session.entity';


export class SessionsViewDto {
  ip: string;
  title: string;
  lastActiveDate: Date;
  deviceId: string;

  static mapToView(session: SessionDocument): SessionsViewDto {
    const dto = new SessionsViewDto();

    // dto.id = session._id.toString();
    dto.ip = session.ip;
    dto.title = session.title;
    dto.lastActiveDate = session.lastActiveDate;
    dto.deviceId = session.deviceId;

    return dto;
  }
}
