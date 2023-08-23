import * as fs from "fs";


export async function fileToBase64(file: string) {
	const buffer = await fs.readFileSync(file);
	return buffer.toString('base64');
}

export async function base64ToFile(contentAsBase64: string, file: string) {
	const bitmap = Buffer.from(contentAsBase64, 'base64');
	await fs.writeFileSync(file, bitmap);
}
