import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import os from "os";
import { writeFile } from "fs/promises";

let groq = null;
function getGroq() {
  if (!groq) groq = new Groq({ apiKey: process.env.API_KEY });
  return groq;
}

export async function POST(req) {
  let filePath;
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const tempDir = os.tmpdir();
    filePath = path.join(tempDir, `uploaded_${Date.now()}.webm`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    const transcription = await getGroq().audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    return NextResponse.json({ text: transcription.text }, { status: 200 });
  } catch (error) {
    console.error("Transcription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
