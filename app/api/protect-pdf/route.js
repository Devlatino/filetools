import { NextResponse } from "next/server";
import { join } from "path";
import { pathToFileURL } from "url";

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const password = formData.get("password");
  const allowPrint = formData.get("allowPrint") === "true";

  if (!file || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!password || typeof password !== "string") {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const inputBytes = new Uint8Array(bytes);

    // Import qpdf WASM solo server-side nell'API route (createModule è l'export del pacchetto)
    const createModule = (await import("@neslinesli93/qpdf-wasm")).default;
    const wasmPath = join(process.cwd(), "node_modules/@neslinesli93/qpdf-wasm/dist/qpdf.wasm");
    const qpdf = await createModule({
      locateFile: () => pathToFileURL(wasmPath).href,
    });

    // Scrivi input nel filesystem virtuale WASM
    qpdf.FS.writeFile("/input.pdf", inputBytes);

    // Esegui cifratura
    qpdf.callMain([
      "--encrypt",
      password,
      password + "_owner",
      "256",
      allowPrint ? "--print=full" : "--print=none",
      "--modify=none",
      "--extract=n",
      "--",
      "/input.pdf",
      "/output.pdf",
    ]);

    const result = qpdf.FS.readFile("/output.pdf");

    // Cleanup virtual FS
    qpdf.FS.unlink("/input.pdf");
    qpdf.FS.unlink("/output.pdf");

    return new NextResponse(result, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
      },
    });
  } catch (err) {
    console.error("protect-pdf error:", err);
    return NextResponse.json({ error: err.message || "Failed to protect PDF" }, { status: 500 });
  }
}
