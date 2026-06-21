export async function onRequest() {
  return Response.json({
    success: true,
    message: "API attiva"
  });
}