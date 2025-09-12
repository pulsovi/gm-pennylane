import { APIJournal } from "./Journal/index.js";
import { apiRequest } from "./core.js";

export async function getJournal(id: number): Promise<APIJournal> {
  const response = await apiRequest(`accountants/journals/${id}`, null, "GET");
  const data = await response?.json();
  return APIJournal.Create(data);
}
