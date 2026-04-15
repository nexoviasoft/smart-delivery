import { sendToSteadfast } from "@/lib/courier/steadfast";
import { sendToPathao } from "@/lib/courier/pathao";

export async function sendCourierOrder({ courierType, config, delivery }) {
  if (courierType === "steadfast") {
    return sendToSteadfast({ config, delivery });
  }
  if (courierType === "pathao") {
    return sendToPathao({ config, delivery });
  }

  throw new Error(`Unsupported courier '${courierType}'`);
}
