import Logger from "../framework/Logger.js";
import { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIRecordComment } from "./Record/Comment.js";
import { APIRecordCommentList } from "./Record/CommentList.js";

export type RecordType = "BankTransaction";

export type CommentName = "client";
const logger = new Logger("API:records");

export async function getRecordComments(
  recordId: number,
  maxAge?: number,
  {
    name = "client",
    type = "BankTransaction",
  }: {
    name?: CommentName;
    type?: RecordType;
  } = {}
): Promise<APIRecordComment[]> {
  const data = await cachedRequest(
    "records:getRecordComments",
    { recordId, name, type },
    async ({ recordId, name, type }) => {
      let page = 1;
      const response = await apiRequest(
        `comments?record_id=${recordId}&record_type=${type}&name[]=${name}&per_page=20&page=${page}`,
        null,
        "GET"
      );
      const data: APIRecordCommentList = await response.json();
      if (data.pagination.hasNextPage) {
        logger.error("todo: le multi page n'est pas implémenté pour la fonction getRecordComments", {
          recordId,
          name,
          type,
          data,
        });
      }
      return data.comments;
    },
    maxAge
  );
  if (!data) {
    logger.error("getRecordComments: empty data", { recordId, name, type });
    return [];
  }
  return data.map((item) => APIRecordComment.Create(item));
}

export async function getTransactionClientsComments(transactionId: number, maxAge?: number) {
  return await getRecordComments(transactionId, maxAge, { type: "BankTransaction", name: "client" });
}
