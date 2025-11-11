import { APIJournal } from "./Journal/index.js";
import { APIOperation } from "./Operation/index.js";
import { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { getOperation } from "./operation.js";

export async function getJournal(id: number, maxAge?: number): Promise<APIJournal> {
  const data = await cachedRequest(
    "journal:getJournal",
    { id },
    async ({ id }) => {
      const response = await apiRequest(`journals/${id}`, null, "GET");
      return await response?.json();
    },
    maxAge
  );
  if (!data) return null;
  return APIJournal.Create(data);
}

export async function getDocumentJournal(id: number, maxAge?: number): Promise<APIOperation["journal"] | null> {
  const operation = await getOperation(id, maxAge);
  if (!operation) return null;
  return operation.journal ?? (await getJournal(operation.journal_id, maxAge));
}