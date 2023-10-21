export async function POST(request: Request) {
  const json = await request.json();
  console.log("got request");
  console.log(json);
  return Response.json({ id: "ABC" });
}
