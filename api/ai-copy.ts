import { generateCopy, type AiCopyRequest } from "../server/generateCopy";

type NodeRes = {
  status: (code: number) => NodeRes;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
};

export default async function handler(
  req: { method?: string; body?: AiCopyRequest },
  res: NodeRes,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method" });
    return;
  }
  try {
    const result = await generateCopy(req.body as AiCopyRequest);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: "ai_failed" });
  }
}
