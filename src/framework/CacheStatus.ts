import CacheListRecord from "./CacheListRecord";

export interface Status {
  createdAt: number;
  id: number;
  ignored?: boolean;
  message: string;
  valid: boolean;
  date: number;
}

export default class CacheStatus extends CacheListRecord<Status> {}
