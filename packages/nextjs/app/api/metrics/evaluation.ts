import { Db } from "mongodb";
import { Evaluation } from "~~/app/hackathon";

export async function storeEvaluationByProject(
 db: Db,
 projectId: string,
 usedEmbeddings: string[],
 embeddingId: string,
 evaluation: Evaluation,
) {
 const hackCodex = db.collection("hackerUniverse");
 const evaluations = db.collection("evaluations");

 const evaluationData = {
  projectId,
  usedEmbeddings,
  evaluation,
  embeddingId,
 };

 const addEvalResult = await hackCodex.updateOne(
  { id: projectId },
  { $addToSet: { eval: evaluationData } },
  { upsert: true },
 );

 const evalResult = await evaluations.insertOne(evaluationData);

 return { evaluation, result: evalResult, addEvalResult };
}
