abstract class IJob {
  abstract readonly name: string;
  abstract execute(): Promise<void>;
}

export = IJob;
