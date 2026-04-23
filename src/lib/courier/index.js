<<<<<<< HEAD
import { sendToSteadfast, trackSteadfastOrder } from "@/lib/courier/steadfast";
=======
import { sendToSteadfast } from "@/lib/courier/steadfast";
import { sendToPathao } from "@/lib/courier/pathao";
>>>>>>> 790594a (update)

export async function sendCourierOrder({ courierType, config, delivery }) {
  if (courierType === "steadfast") {
    return sendToSteadfast({ config, delivery });
  }
<<<<<<< HEAD

  throw new Error(`Unsupported courier '${courierType}'`);
}

export async function trackCourierOrder({ courierType, config, delivery }) {
  if (courierType === "steadfast") {
    return trackSteadfastOrder({ config, delivery });
=======
  if (courierType === "pathao") {
    return sendToPathao({ config, delivery });
>>>>>>> 790594a (update)
  }

  throw new Error(`Unsupported courier '${courierType}'`);
}
