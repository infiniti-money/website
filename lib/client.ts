export async function api(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<any> {
  const r = await fetch(`/api/${path}`, {
    method: body ? method : "GET",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = (await r.json()) as any;
  if (!r.ok) throw new Error(result.error || "Chưa thực hiện được yêu cầu.");
  return result;
}
export const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  new: "Yêu cầu mới",
  confirmed: "Đã xác nhận",
};
