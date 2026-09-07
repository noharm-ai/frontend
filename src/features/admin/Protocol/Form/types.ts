export interface IProtocolFormBaseFields {
  id?: number;
  name?: string;
  protocolType?: number;
  statusType?: number;
  config: {
    variables?: any[];
    trigger?: string;
    result: {
      level: string;
      message: string;
      description: string;
    };
    // Protocols saved before this flag existed have no key stored (reads as false).
    onlyLatestExpireDate?: boolean;
  };
  createdAt?: string;
}

export const emptyProtocol = (): IProtocolFormBaseFields => ({
  name: "",
  protocolType: undefined,
  statusType: undefined,
  config: {
    variables: [],
    trigger: "",
    result: {
      level: "",
      message: "",
      description: "",
    },
    onlyLatestExpireDate: false,
  },
});
