import { IAppointment } from "../IAppointment";

export interface GetAppointmentsResponsDTO {
  appointments: IAppointment[];
  pagination: PaginationDetails;
}

interface PaginationDetails {
  page: number;
  limit: number;
  totalCount: number;
}
