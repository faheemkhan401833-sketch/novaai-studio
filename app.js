const TOOLS = {
  blog: {
    title: "📝 Blog Article Writer",
    desc: "Generate SEO-optimized, high-ranking blog posts in seconds.",
    placeholder: "e.g., 5 Best AI Side Hustles to Start in 2026...",
    prompt: (topic, tone, length, lang) =>
      `Write a structured, SEO-optimized blog article about "${topic}". Tone: ${tone}. Length: ${length}. Language: ${lang}. Include clear headings and bullet points.`
  },
  youtube: {
    title: "🎬 YouTube Script Pro",
    desc: "Create high-retention video scripts with strong hooks and CTAs.",
    placeholder: "e.g., How to Build a Mobile App Without Coding...",
    prompt: (topic, tone, length, lang) =>
      `Write a complete YouTube video script about "${topic}". Include a viral 10-second hook, main points, and outro CTA. Tone: ${tone}. Length: ${length}. Language: ${lang}.`
  },
  social: {
    title: "📱 Viral Social Captions",
    desc: "Generate engaging Instagram, TikTok, and LinkedIn captions with hashtags.",
    placeholder: "e.g., Launching our new dark-mode AI content studio...",
    prompt: (topic, tone, length, lang) =>
      `Create 5 engaging social media captions (Instagram, TikTok, LinkedIn) about "${topic}" with trending hashtags. Tone: ${tone}. Length: ${length}. Language: ${lang}.`
  },
  email: {
    title: "✉️ Cold Email Generator",
    desc: "Craft persuasive business and client outreach emails.",
    placeholder: "e.g., Pitching SEO services to an online store...",
    prompt: (topic, tone, length, lang) =>
      `Write a persuasive cold outreach email about "${topic}" with 3 catchy subject line options. Tone: ${tone}. Length: ${length}. Language: ${lang}.`
  },
  summary: {
    title: "📚 Smart Summarizer",
    desc: "Turn long articles or notes into clear, bulleted key takeaways.",
    placeholder: "Paste your long paragraph or article text here...",
    prompt: (topic, tone, length, lang) =>
      `Summarize the following text into clear bullet points highlighting the key takeaways. Tone: ${tone}. Length: ${length}. Language: ${lang}.\n\nText:\n${topic}`
  },
  code: {
    title: "💻 Code Debugger Pro",
    desc: "Find bugs, optimize code, and get clear explanations.",
    placeholder: "Paste your HTML, CSS, JS, or Python code here...",
    prompt: (topic, tone, length, lang) =>
      `Analyze this code, explain how it works, fix any bugs, and provide the improved code. Tone: ${tone}. Length: ${length}. Language: ${lang}.\n\nCode:\n${topic}`
  },
  ads: {
    title: "📢 Ad Copywriter",
    desc: "Write high-converting Facebook, Instagram, and Google ad copy.",
    placeholder: "e.g., Smart fitness watch with 14-day battery life...",
    prompt: (topic, tone, length, lang) =>
      `Create 3 high-converting ad variations (Headline, Primary Text, CTA) for "${topic}". Tone: ${tone}. Length: ${length}. Language: ${lang}.`
  },
  seo: {
    title: "🔍 SEO Keyword Finder",
    desc: "Discover high-intent keywords and blog title ideas.",
    placeholder: "e.g., Best laptops for video editing...",
    prompt: (topic, tone, length, lang) =>
      `Generate an SEO keyword list for "${topic}" grouped by search intent, plus 5 click-worthy blog titles. Tone: ${tone}. Length: ${length}. Language: ${lang}.`
  }
};

let currentTool = "blog";
let apiKey = localStorage.getItem("nova_gemini_key") || "";
let historyItems = JSON.parse(localStorage.getItem("nova_history_v2") || "[]");

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");
const toolBtns = document.querySelectorAll(".tool-btn");
const currentToolTitle = document.getElementById("currentToolTitle");
const toolDesc = document.getElementById("toolDesc");
const topicInput = document.getElementById("topicInput");
const toneSelect = document.getElementById("toneSelect");
const lengthSelect = document.getElementById("lengthSelect");
const langSelect = document.getElementById("langSelect");
const generateBtn = document.getElementById("generateBtn");
const outputBox = document.getElementById("outputBox");
const wordCount = document.getElementById("wordCount");
const apiStatus = document.getElementById("apiStatus");

const settingsModal = document.getElementById("settingsModal");
const openSettingsBtn = document.getElementById("openSettingsBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const apiKeyInput = document.getElementById("apiKeyInput");
const themeToggleBtn = document.getElementById("themeToggleBtn");
function init() {
  updateApiBadge();
  renderHistory();
  if (apiKey) apiKeyInput.value = apiKey;
}

function updateApiBadge() {
  if (apiKey && apiKey.trim().length > 10) {
    apiStatus.textContent = "API Connected";
    apiStatus.className = "status-badge online";
  } else {
    apiStatus.textContent = "API Key Missing";
    apiStatus.className = "status-badge offline";
  }
}

function updateStats(text) {
  const clean = text.trim();
  const words = clean ? clean.split(/\s+/).length : 0;
  wordCount.textContent = `${words} words | ${clean.length} chars`;
}

toolBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    toolBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentTool = btn.dataset.tool;
    const data = TOOLS[currentTool];
    currentToolTitle.textContent = data.title;
    toolDesc.textContent = data.desc;
    topicInput.placeholder = data.placeholder;
    sidebar.classList.remove("open");
  });
});

menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
openSettingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
closeModalBtn.addEventListener("click", () => settingsModal.classList.add("hidden"));

saveKeyBtn.addEventListener("click", () => {
  apiKey = apiKeyInput.value.trim();
  localStorage.setItem("nova_gemini_key", apiKey);
  updateApiBadge();
  settingsModal.classList.add("hidden");
});

themeToggleBtn.addEventListener("click", () => {
  const html = document.documentElement;
  if (html.classList.contains("dark")) {
    html.classList.replace("dark", "light");
    themeToggleBtn.textContent = "🌙 Dark Mode";
  } else {
    html.classList.replace("light", "dark");
    themeToggleBtn.textContent = "☀️ Light Mode";
  }
});

generateBtn.addEventListener("click", async () => {
  const topic = topicInput.value.trim();
  if (!topic) {
    alert("Please enter a topic or text first!");
    return;
  }
  if (!apiKey) {
    settingsModal.classList.remove("hidden");
    return;
  }

  generateBtn.disabled = true;
  generateBtn.textContent = "⏳ Generating...";
  outputBox.textContent = "Thinking and crafting your content...";
  updateStats("");

  const promptText = TOOLS[currentTool].prompt(
    topic,
    toneSelect.value,
    lengthSelect.value,
    langSelect.value
  );

  try {
    const p1 = "generativelanguage";
    const p2 = "://";
    const url = "https://" + p1 + p2 + encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || "API Error");

    const firstCandidate = data.candidates && data.candidates.at(0);
    const firstPart = firstCandidate && firstCandidate.content && firstCandidate.content.parts && firstCandidate.content.parts.at(0);
    const resultText = (firstPart && firstPart.text) || "No response generated.";

    outputBox.textContent = resultText;
    updateStats(resultText);
    saveToHistory(TOOLS[currentTool].title, topic, resultText);
  } catch (err) {
    outputBox.textContent = `Error: ${err.message}\n\nPlease check your API Key in Settings.`;
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "✨ Generate AI Content";
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(outputBox.textContent);
  alert("Copied to clipboard!");
});

document.getElementById("downloadTxtBtn").addEventListener("click", () => {
  const blob = new Blob([outputBox.textContent], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `NovaAI-${currentTool}-${Date.now()}.txt`;
  a.click();
});

document.getElementById("downloadHtmlBtn").addEventListener("click", () => {
  const cleanHtml = outputBox.textContent.replace(/\n/g, "<br>");
  const doc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>NovaAI Export</title></head><body style="font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.6">${cleanHtml}</body></html>`;
  const blob = new Blob([doc], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `NovaAI-${currentTool}-${Date.now()}.html`;
  a.click();
});

document.getElementById("clearBtn").addEventListener("click", () => {
  outputBox.innerHTML = `<p class="placeholder-text">Your commercial-grade AI result will appear here...</p>`;
  updateStats("");
});

function saveToHistory(toolName, prompt, result) {
  historyItems.unshift({
    tool: toolName,
    prompt: prompt.slice(0, 55) + (prompt.length > 55 ? "..." : ""),
    result: result
  });
  if (historyItems.length > 15) historyItems.pop();
  localStorage.setItem("nova_history_v2", JSON.stringify(historyItems));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  if (!historyItems.length) {
    list.innerHTML = `<p class="placeholder-text">No saved generations yet.</p>`;
    return;
  }
  list.innerHTML = historyItems
    .map(
      (item, idx) => `
      <div class="history-item">
        <strong>${item.tool}</strong>
        <span>${item.prompt}</span>
        <div class="history-btns">
          <button class="action-btn" onclick="loadHistory(${idx})">Load</button>
          <button class="action-btn" onclick="deleteHistory(${idx})">Delete</button>
        </div>
      </div>`
    )
    .join("");
}

window.loadHistory = function (idx) {
  outputBox.textContent = historyItems[idx].result;
  updateStats(historyItems[idx].result);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteHistory = function (idx) {
  historyItems.splice(idx, 1);
  localStorage.setItem("nova_history_v2", JSON.stringify(historyItems));
  renderHistory();
};

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  historyItems = [];
  localStorage.removeItem("nova_history_v2");
  renderHistory();
});

init();
