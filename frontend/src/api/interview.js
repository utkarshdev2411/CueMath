import client from "./client";

export async function postChat(messages, turnCount) {
  const { data } = await client.post("/api/chat", { messages, turn_count: turnCount });
  return data;
}

export async function postAssess(transcript, candidateName) {
  const { data } = await client.post("/api/assess", { transcript, candidate_name: candidateName });
  return data;
}
