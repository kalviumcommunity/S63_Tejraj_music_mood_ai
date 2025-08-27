// Prompt builders for each concept mode.
// We keep "reasoning" concise on purpose.

export function buildPrompt({ mode, moodText }) {
  const baseInstruction =
    "You are a helpful music recommender. Return 5 songs as JSON array with fields: title, artist. Also include a single-sentence rationale.";

  Zero_Shot_Prompting
// zero shot prompt 
=======
 main
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


// multi shot prompting 
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

// dyanmic prompt 
  const dynamicPrompt = () => {
    // If user typed a long text, nudge style. Short -> direct.
    const long = moodText.length > 40;
    const style = long
      ? "User wrote a paragraph; infer nuanced emotions and pick varied eras."
      : "User wrote a keyword; pick mainstream crowd-pleasers.";
    return `${baseInstruction}\n${style}\nMood: "${moodText}".`;
  };

  return {
 Zero_Shot_Prompting
    "zero-shot": zeroShot(), // zero one shot prompt 
=======
    "zero-shot": zeroShot(),
 main
    "one-shot": oneShot(), // one shot prompting
    "multi-shot": multiShot(), // multi shot prompting 
    "chain-of-thought": chainOfThought(),
 Temperature
    "dynamic-prompt": dynamicPrompt() // Dynamic Prompt
  }[mode] || zeroShot(); // zero shot
=======
    "dynamic-prompt": dynamicPrompt()
 Zero_Shot_Prompting
  }[mode] || zeroShot(); // zero shot 
=======
  }[mode] || zeroShot();
 main
 main
}
  