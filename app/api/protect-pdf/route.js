import { NextResponse } from "next/server";
import { encrypt } from "node-qpdf2";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import crypto from "crypto";

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

  const id = crypto.randomUUID();
  const inputPath = join(tmpdir(), `${id}_input.pdf`);
  const outputPath = join(tmpdir(), `${id}_output.pdf`);

  try {
    const bytes = await file.arrayBuffer();
    await writeFile(inputPath, Buffer.from(bytes));

    await encrypt({
      input: inputPath,
      output: outputPath,
      keyLength: 256,
      password: {
        user: password,
        owner: password + "_owner",
      },
      restrictions: {
        print: allowPrint ? "full" : "none",
        modify: "none",
        extract: "n",
        annotate: "n",
      },
    });

    const result = await readFile(outputPath);

    return new NextResponse(result, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="protected.pdf"',
      },
    });
  } catch (err) {
    console.error("protect-pdf error:", err);
    return NextResponse.json({ error: err.message || "Failed to protect PDF" }, { status: 500 });
  } finally {
    await unlink(inputPath).catch(() => {});
    await unlink(outputPath).catch(() => {});
  }
}
