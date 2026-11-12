import * as systemService from "../services/systemService";
import { parseApiError } from "../models/authModel";
import { fromHealth, fromSchema } from "../models/systemModel";

// Never throws: an unreachable server is reported as "down"
export const checkHealth = async () => {
  try {
    return fromHealth(await systemService.getHealth());
  } catch (err) {
    return {
      ok: false,
      status: "down",
      raw: { error: parseApiError(err, "Health check failed") },
      checkedAt: new Date().toLocaleTimeString(),
    };
  }
};

export const loadSchema = async () => {
  try {
    return fromSchema(await systemService.getSchema());
  } catch (err) {
    throw new Error(parseApiError(err, "Could not load API schema"));
  }
};