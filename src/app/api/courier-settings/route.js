import connectDB from "@/lib/mongodb";
import CourierSetting from "@/models/CourierSetting";
import { assertTenantContext } from "@/lib/auth-context";
import { COURIER_TYPES } from "@/lib/constants";
import { apiError, apiOk } from "@/lib/http";

export async function GET(request) {
  const auth = assertTenantContext(request);
  if (auth.error) return apiError(auth.error, auth.status);

  await connectDB();
  const settings = await CourierSetting.find({
    companyId: auth.context.companyId,
  }).sort({ courierType: 1 });

  return apiOk(settings);
}

export async function PUT(request) {
  const auth = assertTenantContext(request);
  if (auth.error) return apiError(auth.error, auth.status);

  const body = await request.json();
  const { courierType, apiKey, secretKey, baseUrl, isActive, isDefault } = body;

  if (!COURIER_TYPES.includes(courierType)) {
    return apiError("Invalid courier type", 400);
  }
  if (!apiKey || !secretKey || !baseUrl) {
    return apiError("apiKey, secretKey and baseUrl are required", 400);
  }

  await connectDB();
  if (isDefault) {
    await CourierSetting.updateMany(
      { companyId: auth.context.companyId },
      {
        $set: {
          isDefault: false,
        },
      }
    );
  }

  const setting = await CourierSetting.findOneAndUpdate(
    { companyId: auth.context.companyId, courierType },
    {
      $set: {
        apiKey,
        secretKey,
        baseUrl,
        isActive: Boolean(isActive),
        isDefault: Boolean(isDefault),
      },
    },
    { new: true, upsert: true }
  );

  return apiOk(setting);
}
