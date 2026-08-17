import { ITrainingModule } from "./TrainingCentralSlice";

export const isModuleFinished = (module: ITrainingModule) =>
  module.totalLessons > 0 && module.totalLessonsFinished === module.totalLessons;
