import { Provider } from "../interfaces/IProvider";

// mock data
export const providers: Provider[] = [
  {
    id: "1234",
    name: "Test Provider",
    availableSlots: [],
  },
];

export interface IProvidersService {
  getProvider(providerId: string): Provider | undefined;
}

export class ProvidersService implements IProvidersService {
  getProvider(providerId: string): Provider | undefined {
    // this would be an indexed database query with proper error handling
    return providers.find((provider) => provider.id === providerId);
  }
}
