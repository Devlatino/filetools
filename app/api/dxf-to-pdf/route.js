import { NextResponse } from "next/server";
import CloudConvert from "cloudconvert";
import { Readable } from "stream";

export const maxDuration = 60;

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const cloudConvert = new CloudConvert(apiKey);

    const job = await cloudConvert.jobs.create({
      tasks: {
        "upload-file": {
          operation: "import/upload",
        },
        "convert-file": {
          operation: "convert",
          input: "upload-file",
          input_format: "dxf",
          output_format: "pdf",
        },
        "export-file": {
          operation: "export/url",
          input: "convert-file",
        },
      },
    });

    const uploadTask = job.tasks.find((t) => t.name === "upload-file");
    await cloudConvert.tasks.upload(uploadTask, stream, file.name, buffer.length);

    const completedJob = await cloudConvert.jobs.wait(job.id);

    console.log("Job status:", completedJob.status);
    console.log(
      "Tasks:",
      JSON.stringify(
        completedJob.tasks.map((t) => ({
          name: t.name,
          status: t.status,
          result: t.result,
        })),
        null,
        2
      )
    );

    const exportTask = completedJob.tasks.find(
      (t) => t.operation === "export/url" && t.status === "finished"
    );

    const fallbackTask = completedJob.tasks.find(
      (t) => t.status === "finished" && t.result?.files?.length > 0
    );

    const finalTask = exportTask || fallbackTask;

    if (!finalTask?.result?.files?.[0]?.url) {
      const failedTask = completedJob.tasks.find((t) => t.status === "error");
      console.error("Failed task:", JSON.stringify(failedTask, null, 2));
      throw new Error(
        `Conversion failed: no output file. Job status: ${completedJob.status}`
      );
    }

    const outputUrl = finalTask.result.files[0].url;
    const outputFilename = finalTask.result.files[0].filename || "output.pdf";

    // SSRF protection: only fetch from cloudconvert.com domains
    const parsedUrl = new URL(outputUrl);
    if (!parsedUrl.hostname.endsWith(".cloudconvert.com") && parsedUrl.hostname !== "cloudconvert.com") {
      throw new Error("Invalid output URL host");
    }

    const pdfResponse = await fetch(outputUrl);
    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Safe Content-Disposition with RFC 5987 encoding
    const safeFilename = outputFilename.replace(/[^\w.\-]/g, "_");
    const encodedFilename = encodeURIComponent(outputFilename);

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (err) {
    console.error("dxf-to-pdf error:", err);
    return NextResponse.json(
      { error: err.message || "Conversion failed" },
      { status: 500 }
    );
  }
}
