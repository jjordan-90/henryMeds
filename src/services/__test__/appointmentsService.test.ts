import { IAppointment } from "../../interfaces/IAppointment";
import { Provider } from "../../interfaces/IProvider";
import { IAppointmentsRepository } from "../../interfaces/storage/IAppointmentsRepository";
import { AppointmentsService } from "../appointmentsService";
import { IProvidersService } from "../providersService";
import { Mock, It, Times } from "moq.ts";

describe("AppointmentsService", () => {
  describe("GetAvailableAppointments", () => {
    it("should return the available appointments by providerId", () => {
      const providerId = "provider-123";
      const appointmentMock: IAppointment[] = [
        {
          id: "123",
          providerId,
          start: new Date(),
          end: new Date(),
        },
      ];
      const mockProviderService = new Mock<IProvidersService>();
      const mockAppRepository = new Mock<IAppointmentsRepository>()
        .setup((s) =>
          s.getByProvider(
            It.IsAny() as string,
            It.IsAny() as number,
            It.IsAny() as number,
          ),
        )
        .returns(appointmentMock)
        .setup((s) =>
          s.getTotalCount(
            It.IsAny() as string,
            It.IsAny() as Date,
            It.IsAny() as Date,
          ),
        )
        .returns(It.IsAny() as number);

      const appointmentsService = new AppointmentsService(
        mockProviderService.object(),
        mockAppRepository.object(),
      );
      const clientId = "client-123";

      const result = appointmentsService.getAvailableAppointments(
        providerId,
        1,
        10,
      );
      expect(result.appointments).toHaveLength(1);
      mockAppRepository.verify((i) => i.getByProvider, Times.Once());
    });
  });
  describe("AddAppointmentSlot", () => {
    it("should create appointment slots from a time range", () => {
      const providerId = "provider-123";
      const providerMock: Provider = {
        name: "test-provider",
        id: providerId,
        availableSlots: [],
      };
      const start = new Date("2024-09-01T10:00:00.000Z");
      const end = new Date("2024-09-01T20:00:00.000Z");

      const mockProviderService = new Mock<IProvidersService>()
        .setup((s) => s.getProvider(It.IsAny() as string))
        .returns(providerMock);
      const mockAppRepository = new Mock<IAppointmentsRepository>()
        .setup((s) => s.add(It.IsAny() as IAppointment))
        .returns(undefined);

      const appointmentsService = new AppointmentsService(
        mockProviderService.object(),
        mockAppRepository.object(),
      );
      const clientId = "client-123";

      const result = appointmentsService.addAppointmentSlot(
        providerId,
        start,
        end,
      );
      expect(result.appointments).toHaveLength(40);
    });
  });
});
