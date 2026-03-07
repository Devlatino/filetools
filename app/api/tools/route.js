import { BASE_URL } from "@/lib/constants";
import { tools, getCategoriesWithTools } from "@/lib/toolsData";

const DESCRIPTION =
  "Free browser-based file conversion platform. All processing is client-side. No uploads to servers. No registration required.";

export async function GET() {
  const categories = getCategoriesWithTools().map((cat) => ({
    name: cat.name,
    tools: cat.tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      url: `${BASE_URL}/tools/${t.slug}`,
      input: t.input,
      output: t.output,
      free: t.free,
      serverUpload: t.serverUpload,
    })),
  }));

  const data = {
    name: "FileFlip",
    description: DESCRIPTION,
    url: BASE_URL,
    total: tools.length,
    categories,
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
