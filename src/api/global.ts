import { cachedRequest } from "./cache.js";
import { apiRequest } from "./core.js";
import { APIGlobalContext } from "./Global/Context.js";

export async function getCompanyContext(maxAge?: number) {
  const data = await cachedRequest(
    "getCompanyContext",
    null,
    async () => {
      const response = await apiRequest("context", null, "GET");
      return response.json();
    },
    maxAge
  );
  return APIGlobalContext.Create(data);
}

export async function getExercise(year: number, maxAge?: number) {
  const context = await getCompanyContext(maxAge);
  return context.company.fiscalYears.find((fy) => fy.start.startsWith(year.toString()));
}
