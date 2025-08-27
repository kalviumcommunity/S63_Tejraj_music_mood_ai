// Prompt builders for each concept mode.
// We keep "reasoning" concise on purpose.

export function buildPrompt({ mode, moodText }) {
  const baseInstruction =
    "You are a helpful music recommender. Return 5 songs as JSON array with fields: title, artist. Also include a single-sentence rationale.";

// zero shot prompt 
  const zeroShot = () =>
    `${baseInstruction}\nMood: "${moodText}".`;

// one shot prompting

const oneShot = () =>
    `${baseInstruction}
Example:
Mood: "happy"
Output (JSON array, 2 sample items):
[{"title":"Happy","artist":"Pharrell Williams"},{"title":"Good Vibrations","artist":"The Beach Boys"}]
Now for Mood: "${moodText}".`;


  const multiShot = () =>
    `${baseInstruction}
Examples:
Mood: "sad" -> [{"title":"Someone Like You","artist":"Adele"}]
Mood: "energetic" -> [{"title":"Stronger","artist":"Kanye West"}]
Mood: "calm" -> [{"title":"Weightless","artist":"Marconi Union"}]
Now for Mood: "${moodText}".`;

  const chainOfThought = () =>
    `${baseInstruction}
Think briefly about mood characteristics (genres/tempos/instruments), then output.
Mood: "${moodText}".
Return JSON only and a short "rationale" string (max 1 sentence).`;

  const dynamicPrompt = () => {
    // If user typed a long text, nudge style. Short -> direct.
    const long = moodText.length > 40;
    const style = long
      ? "User wrote a paragraph; infer nuanced emotions and pick varied eras."
      : "User wrote a keyword; pick mainstream crowd-pleasers.";
    return `${baseInstruction}\n${style}\nMood: "${moodText}".`;
  };

  return {
    "zero-shot": zeroShot(), // zero one shot prompt 
    "one-shot": oneShot(), // one shot prompting
    "multi-shot": multiShot(),
    "chain-of-thought": chainOfThought(),
    "dynamic-prompt": dynamicPrompt()
  }[mode] || zeroShot(); // zero shot 
}
