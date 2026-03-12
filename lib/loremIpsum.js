const WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur",
  "adipiscing", "elit", "sed", "do", "eiusmod", "tempor",
  "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua",
  "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation",
  "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "reprehenderit", "in",
  "voluptate", "velit", "esse", "cillum", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non",
  "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit",
  "anim", "id", "est", "laborum", "perspiciatis", "unde", "omnis",
  "iste", "natus", "error", "accusantium", "doloremque", "laudantium",
  "totam", "rem", "aperiam", "eaque", "ipsa", "quae", "ab", "illo",
  "inventore", "veritatis", "quasi", "architecto", "beatae", "vitae",
  "dicta", "explicabo", "nemo", "ipsam", "voluptatem", "quia", "voluptas",
  "aspernatur", "aut", "odit", "fugit", "consequuntur", "magni",
  "dolores", "eos", "ratione", "sequi", "nesciunt", "neque", "porro",
  "quisquam", "numquam", "eius", "modi", "tempora", "incidunt",
  "magnam", "quaerat", "facilis", "rerum", "repellendus", "distinctio",
  "provident", "similique", "mollitia", "cumque", "dignissimos",
  "blanditiis", "praesentium", "deleniti", "atque", "corrupti",
  "quos", "quam", "maxime", "placeat", "facere", "possimus", "omnis",
  "assumenda", "repellat", "temporibus", "quibusdam", "officiis",
  "debitis", "rerum", "necessitatibus", "saepe", "eveniet",
];

const LOREM_START =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateSentence(lengthMode = "medium") {
  const lengths = { short: [6, 10], medium: [10, 18], long: [18, 28] };
  const [min, max] = lengths[lengthMode] || lengths.medium;
  const wordCount = getRandomInt(min, max);
  const words = Array.from({ length: wordCount }, () => getRandom(WORDS));
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

export function generateParagraph(sentenceCount = 5, lengthMode = "medium") {
  return Array.from({ length: sentenceCount }, () =>
    generateSentence(lengthMode)
  ).join(" ");
}

export function generateText({
  type,
  amount,
  startWithLorem,
  includeHtml,
  sentenceLength,
  seed,
}) {
  const sentencesPerParagraph = {
    short: getRandomInt(3, 5),
    medium: getRandomInt(4, 7),
    long: getRandomInt(6, 9),
  };
  const sentCount =
    sentencesPerParagraph[sentenceLength] ||
    sentencesPerParagraph.medium;

  switch (type) {
    case "paragraphs": {
      const paras = Array.from({ length: amount }, (_, i) => {
        const sentences = Array.from({ length: sentCount }, () =>
          generateSentence(sentenceLength)
        );
        if (i === 0 && startWithLorem) sentences[0] = LOREM_START;
        const text = sentences.join(" ");
        return includeHtml ? `<p>${text}</p>` : text;
      });
      return paras.join(includeHtml ? "\n\n" : "\n\n");
    }
    case "sentences": {
      const sentences = Array.from({ length: amount }, (_, i) => {
        if (i === 0 && startWithLorem) return LOREM_START;
        return generateSentence(sentenceLength);
      });
      return sentences.join("\n");
    }
    case "words": {
      const words = Array.from({ length: amount }, () => getRandom(WORDS));
      if (startWithLorem) {
        const loremWords = LOREM_START.replace(/[.,]/g, "")
          .toLowerCase()
          .split(" ");
        words.splice(
          0,
          Math.min(loremWords.length, amount),
          ...loremWords.slice(0, amount)
        );
      }
      return words.join(" ");
    }
    case "list": {
      const items = Array.from({ length: amount }, (_, i) => {
        const s =
          i === 0 && startWithLorem
            ? LOREM_START.replace(".", "")
            : generateSentence(sentenceLength).replace(".", "");
        return includeHtml ? `  <li>${s}</li>` : `• ${s}`;
      });
      return includeHtml
        ? `<ul>\n${items.join("\n")}\n</ul>`
        : items.join("\n");
    }
    case "html": {
      const sections = Array.from({ length: amount }, (_, i) => {
        const heading = generateSentence("short").replace(".", "");
        const p1 = generateParagraph(4, sentenceLength);
        const p2 = generateParagraph(3, sentenceLength);
        const listItems = Array.from({ length: 4 }, () =>
          `  <li>${generateSentence("short").replace(".", "")} </li>`
        ).join("\n");
        return `<h2>${heading}</h2>\n<p>${i === 0 && startWithLorem ? LOREM_START + " " : ""}${p1}</p>\n<p>${p2}</p>\n<ul>\n${listItems}\n</ul>`;
      });
      return sections.join("\n\n");
    }
    default:
      return "";
  }
}
