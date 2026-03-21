// ─────────────────────────────────────────────────────────────────────────────
// IELTS Study Plans — 3 tiers
// Plan A  25 Day Plan   25 days  / 5 weeks   /  13 full mocks  / Band 6.5+  (2–3h/day)
// Plan B  2-Month Plan  ~2 months/ 8 weeks   /  20 full mocks  / Band 7.0+  (3–4h/day)
// Plan C  3-Month Plan  ~3 months/ 12 weeks  /  32 full mocks  / Band 7.5+  (3–4h/day)
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_META = [
  {
    id: "sprint", label: "25 Day Plan", unit: "Week", days: 25, weeks: 5, mocks: 13,
    targetBand: "6.5+", color: "#7c3aed", accent: "#ede9fe",
    badge: "Best for retakes",
    description: "25-day intensive plan. Perfect if your English is already at B2 level and you need exam technique, structure, and lots of timed practice with feedback.",
    forWho: "I know English well — I just need exam technique and practice",
    dailyHours: "2–3 hrs/day",
    highlights: ["13 full mock tests", "Simon's method for all 4 skills", "Daily Jumpinto + Engnovate practice", "Band 6.5+ target"],
    retakeWeek: null, retakeLabel: null,
  },
  {
    id: "standard", label: "2-Month Plan", unit: "Month", days: 56, weeks: 8, mocks: 20,
    targetBand: "7.0+", color: "#0ea5e9", accent: "#e0f2fe",
    badge: "Most popular",
    description: "2-month plan. Build every skill step by step using Simon's proven methods, practice daily with AI feedback on Jumpinto and Engnovate, and complete 20 full mock tests.",
    forWho: "I want a full preparation with deep skill-building and lots of practice",
    dailyHours: "3–4 hrs/day",
    highlights: ["20 full mock tests", "Simon's method + templates", "Daily AI feedback on Jumpinto & Engnovate", "Band 7.0+ target"],
    retakeWeek: 5, retakeLabel: "Already familiar with IELTS? Jump to Month 2 →",
  },
  {
    id: "comprehensive", label: "3-Month Plan", unit: "Month", days: 84, weeks: 12, mocks: 32,
    targetBand: "7.5+", color: "#f97316", accent: "#fff7ed",
    badge: "Highest band target",
    description: "3-month complete programme. Deep language building, full Simon-method exam mastery, daily AI practice on Jumpinto and Engnovate, human speaking on Discord, and 32 full mock tests.",
    forWho: "I want the highest possible score with full preparation",
    dailyHours: "3–4 hrs/day",
    highlights: ["32 full mock tests", "Simon's full method + grammar", "Daily Jumpinto, Engnovate & Discord speaking", "Band 7.5+ target"],
    retakeWeek: 5, retakeLabel: "Already familiar with IELTS? Jump to Month 2 →",
  },
]

// Helper
const T = (label, detail) => ({ label, detail })

// ─────────────────────────────────────────────────────────────────────────────
// PLAN A — SPRINT (5 weeks, 10 full mock tests)
// Language: simple, clear, B1/B2 friendly
// Tasks: short and explicit. HOW = step-by-step instructions.
// Speaking: write templates + practice on JumpInto (no recording)
// ─────────────────────────────────────────────────────────────────────────────
export const sprintPlan = [
  {
    week: 1,
    label: "Week 1",
    days: [
      {
        day: 1,
        morning: {
          title: "Listening — Learn the Test Format",
          subtasks: [
            T("Watch Simon's Listening overview lesson (30 min)", "Go to ieltssimonfree.com and find the Listening lessons section. Simon explains the 4 sections clearly: Sections 1–2 are everyday conversations (easier), Sections 3–4 are academic (harder). His key rule: use every pause between sections to read the NEXT set of questions, not check your previous answers. Write this rule in your notebook."),
            T("Do Section 1 practice — focus on spelling (25 min)", "Use Cambridge IELTS Book 13, 14, or 15 (or Jumpinto.com Listening practice). Listen and write answers. One spelling mistake = wrong answer — no exceptions. The most commonly misspelled words: accommodation, necessary, environment. Write them now and memorise them."),
            T("Write 10 new words in your vocabulary notebook", "For each word: write it, what it means, and one example sentence. Example: 'accommodate (verb) — to provide a place to stay. The hotel can accommodate 200 guests.' This notebook is your most important study tool — use it every day."),
          ]
        },
        afternoon: {
          title: "Reading — Learn the Test Format",
          subtasks: [
            T("Learn Simon's Reading approach + the 3 main question types (30 min)", "Simon's core rule: Reading is a vocabulary test in disguise. The skill is matching words in the question to paraphrased words in the passage. Go to his reading lessons on ieltssimonfree.com. The 3 most important question types: (1) True/False/Not Given — you only use what the text says, never your own knowledge. (2) Matching Headings — read only the first sentence of each paragraph. (3) Summary Completion — the answer words come directly from the text."),
            T("Read one academic passage — locate, then understand (25 min)", "Simon's method: locate first, understand second. Step 1: read only the first sentence of each paragraph to find the general topic. Step 2: go back to the relevant paragraph only when you have a specific question. You do NOT need to read the whole passage before answering questions. Practise this approach now with one passage from Cambridge IELTS or engnovate.com."),
            T("Write 5 new words from the passage in your notebook", "Write the word, the sentence where you found it, and what you think it means. Then check the dictionary."),
          ]
        }
      },
      {
        day: 2,
        morning: {
          title: "Listening — Numbers and Spelling Practice",
          subtasks: [
            T("Section 1 practice — phone numbers, dates, addresses (35 min)", "The most common Section 1 topics. Simon's tip: read ALL the questions before the audio starts — use every second of silence to prepare. Common mistakes: confusing 13 and 30 (say them aloud — 'thirTEEN' vs 'THIRty', the stress is different). Dates: both '15 March' and 'March 15th' are correct. Use Jumpinto.com Listening practice or Cambridge IELTS books."),
            T("Check answers and find the reason for each mistake (15 min)", "For every wrong answer, ask: (1) Did I not hear it? (2) Did I spell it wrong? (3) Was I still writing the previous answer when this one was said? Write the reason next to each mistake. Tracking the TYPE of mistake is more useful than just checking the score. You can also review your answers using the Engnovate Listening checker."),
            T("Spelling drill — write these 10 words 3 times each", "The most common misspelled IELTS words: accommodation, necessary, environment, government, international, development, communication, opportunity, temperature, information. One wrong letter = zero marks. Write each one three times now."),
          ]
        },
        afternoon: {
          title: "Reading — True / False / Not Given Strategy",
          subtasks: [
            T("Learn Simon's True / False / Not Given rule (20 min)", "This is one of the most misunderstood question types. Simon's rule: TRUE = the text clearly says this. FALSE = the text says the OPPOSITE. NOT GIVEN = the text simply does not mention this topic at all. The most common mistake: choosing FALSE when the answer is NOT GIVEN. Ask yourself: 'Does the text say the opposite?' If no — it is NOT GIVEN. Find this lesson on ieltssimonfree.com Reading section and study it carefully."),
            T("Do one set of True / False / Not Given questions (30 min)", "Simon's 3 steps: Step 1 — read the statement. Step 2 — find the relevant part of the text (underline keywords to help you locate it). Step 3 — compare carefully. Only use what the text says — NEVER your own knowledge or opinion. Practise on Engnovate's Reading tests or Cambridge IELTS books."),
            T("Add 8 new words to your notebook", "Focus on the words you did not know during the reading exercise."),
          ]
        }
      },
      {
        day: 3,
        morning: {
          title: "Listening — Section 2 (Maps and Diagrams)",
          subtasks: [
            T("Learn Section 2 — maps and practical topics (20 min)", "Section 2 is one person speaking about something practical — a tour, a community event, a local radio programme. The questions are often about a MAP or DIAGRAM. Simon's rule: before the audio starts, read ALL labels on the map and ALL answer options. The speaker moves around the map in a logical direction — follow along. Look for these lessons on ieltssimonfree.com."),
            T("Do one Section 2 practice test (35 min)", "For map questions: read all labels before pressing play. The speaker moves around the map in a logical order. Follow along and write the answer as you hear it."),
            T("Find 3 distractors in today's audio", "A distractor is when the speaker mentions the wrong answer first, then corrects it. Example: 'The café opens at 9... actually, it opens at 10.' Simon warns about this in every listening lesson. RULE: always wait until the speaker finishes the complete sentence before writing. Write 'WAIT FOR THE FINAL ANSWER' in your notebook and underline it."),
          ]
        },
        afternoon: {
          title: "Reading — Matching Headings Strategy",
          subtasks: [
            T("Learn Simon's Matching Headings strategy (20 min)", "Simon's method (from ieltssimonfree.com): Step 1 — read ALL headings before looking at the passage. Step 2 — for each paragraph, read ONLY the first sentence. The first sentence almost always tells you the main idea. Step 3 — match. Step 4 — cross out headings you have already used. Do NOT read the whole paragraph for every heading — it wastes 5-7 minutes. Write this 4-step process in your notebook."),
            T("Do one Matching Headings passage on Engnovate (35 min)", "Go to engnovate.com — Reading Tests section. Use Simon's 4-step method. If you are stuck between two headings: cross out the ones already used. Look at what remains. Which fits the first sentence better? After finishing, check answers and find the exact sentence that justifies each one."),
            T("Paraphrase practice — rewrite 3 headings in your own words", "Example: 'The economic consequences of urbanisation' → 'How cities affect the economy'. Simon teaches that reading is about matching paraphrased meaning, not identical words. This paraphrase skill also improves your Task 2 writing — you will use it every day."),
          ]
        }
      },
      {
        day: 4,
        morning: {
          title: "Listening — Section 3 and Section 4",
          subtasks: [
            T("Learn Sections 3 and 4 with Simon's tips (25 min)", "Section 3: an academic conversation between students or a student and tutor. The topic changes direction several times — this is where distractors are most dangerous. Section 4: one person giving an academic lecture. There is NO pause between questions — you must write fast and keep reading ahead. Simon's key tip for Section 4: read all 10 questions before it starts, then only listen for answers — do not try to understand every word. Find his Section 4 lessons on ieltssimonfree.com."),
            T("Do one Section 3 practice (35 min)", "The most common trap: all options are mentioned in the audio but only one is the correct answer to the question. Read each question VERY carefully before choosing."),
            T("Write 10 academic collocations in your notebook (15 min)", "These phrases appear in both Listening and Reading — and they boost your Writing score too. Write in your notebook: carry out research, draw a conclusion, reach an agreement, raise awareness, take into account, make an assumption, put forward an argument, come to a decision, lead to consequences, have a significant impact. Write one example sentence for each."),
          ]
        },
        afternoon: {
          title: "Reading — Summary Completion",
          subtasks: [
            T("Learn Summary Completion — Simon's approach (20 min)", "The summary uses different (paraphrased) words from the text, but the ANSWERS come word-for-word from the text. Simon's steps: Step 1 — read the summary to understand what section of the text it covers. Step 2 — find that section in the passage. Step 3 — find the exact word(s) that fit the gap. CRITICAL: always check the word limit. If it says 'NO MORE THAN TWO WORDS', three words = zero marks. This is a very common mistake. Practise on Engnovate Reading tests."),
            T("Do one Summary Completion passage (30 min)", "Always check: does the word fit grammatically in the sentence? Does it make sense? Is it from the text, not your own words?"),
            T("Grammar check — what type of word fits each gap? (10 min)", "Before scanning the text, ask: is this gap a NOUN, VERB, ADJECTIVE, or ADVERB? This tells you what to look for and helps you find the right word faster. Write this rule in your notebook: 'Decide the word TYPE before you search the text.'"),
          ]
        }
      },
      {
        day: 5,
        morning: {
          title: "MOCK TEST 1 — Full Listening + Full Reading",
          subtasks: [
            T("MOCK TEST 1 — Full Listening, 4 sections, 45 minutes (45 min)", "Use Cambridge IELTS Book 13, 14, or 15 — OR use Jumpinto.com for a full AI-scored test. No pausing. No replaying. Write answers on paper, transfer to the answer sheet at the end. This is exactly how the real exam works. Apply Simon's rule: use every silence to read ahead to the NEXT questions."),
            T("MOCK TEST 1 — Full Reading, 3 passages, 60 minutes (60 min)", "20 minutes per passage. If you go over 22 minutes on Passage 1, move on immediately — never sacrifice Passage 3 for Passage 1. Apply Simon's locate-then-understand approach. You can also do this test on Jumpinto.com for instant AI scoring and feedback."),
            T("Score and record your Mock 1 result", "Write in your notebook: Listening __ / 40. Reading __ / 40. Which section was hardest? Which question type caused the most mistakes? This is your starting point. Every future mock will be compared to this number."),
          ]
        },
        afternoon: {
          title: "Mock 1 Review + Plan Your Next Week",
          subtasks: [
            T("Go through every wrong answer and find the reason (30 min)", "For each wrong answer: (a) Did I not hear/see it? (b) Did I misunderstand the question? (c) Did I run out of time? (d) Did a distractor trick me? Write the reason next to each mistake. Finding the REASON is more valuable than just checking the score. If you used Jumpinto, use the AI feedback to help identify patterns."),
            T("Write your Week 1 vocabulary list — 20 most important words", "Look through your notebook from this week. Write the 20 most important words on one page. Read this list every morning for 5 minutes — this takes only 5 minutes but is one of the most effective habits you can build. You can also use Engnovate's flashcard tool to review them digitally."),
            T("Decide your focus for next week (10 min)", "Which section had the most mistakes? Write a specific plan: not 'improve Listening' but 'practise Section 4 every day and review Simon's Section 4 lesson'. Also decide: will you use Jumpinto or Cambridge IELTS books for practice this week? Plan this now."),
          ]
        }
      }
    ]
  },
  {
    week: 2,
    label: "Week 2",
    days: [
      {
        day: 1,
        morning: {
          title: "Listening Practice + Writing Task 1 Introduction",
          subtasks: [
            T("Section 1 and Section 2 practice (35 min)", "Focus on the area you got wrong most in Mock 1. Use Jumpinto.com for AI-scored practice, or Cambridge IELTS books. After each section: check your answers and note the mistake type — spelling, mishearing, or a distractor that tricked you. Apply Simon's rule: read ahead during every pause."),
            T("Learn Simon's Writing Task 1 approach (25 min)", "Task 1 = describe a graph, chart, map, or process in at least 150 words in 20 minutes. Simon's most important rule: you are NOT giving your opinion — only describing what you see. His 4-part structure: (1) Introduction — paraphrase the title. (2) Overview — the 2-3 most important things you notice, NO numbers. (3) Body 1 — main details with numbers. (4) Body 2 — more details or a comparison. Find his Task 1 lessons on ieltssimonfree.com."),
            T("Write 10 trend words in your notebook (15 min)", "These are essential for Task 1. Going UP: rose, increased, grew, climbed, soared. Going DOWN: fell, dropped, decreased, declined, plummeted. Stable: remained stable, stayed at the same level, showed little change. Peak: reached a peak of, peaked at. Write an example sentence for each. These also appear in Reading — knowing them helps both skills."),
          ]
        },
        afternoon: {
          title: "Reading — Matching Information + New Question Types",
          subtasks: [
            T("Learn Matching Information — Simon's method (20 min)", "You are given statements and must find which PARAGRAPH contains each one. The order does NOT follow the passage — you must check all paragraphs. Simon's method: underline the KEY IDEA in the statement, then scan every paragraph for the same idea using different words (paraphrasing). Study this type on ieltssimonfree.com or Engnovate."),
            T("Do one Matching Information passage (30 min)", "After finishing, check your answers. Did you find the right paragraph? Did you look at ALL paragraphs, not just the first few?"),
            T("Add 8 new topic words to your notebook", "Choose words from today's reading passage that you want to remember."),
          ]
        }
      },
      {
        day: 2,
        morning: {
          title: "Listening — Section 3 and 4 Practice",
          subtasks: [
            T("Do Section 3 practice (30 min)", "Remember: in multiple choice, ALL options may be mentioned. Only one is the correct answer to the question. Read the question and options before the audio starts."),
            T("Do Section 4 practice (20 min)", "One academic lecture. No pause. Before it starts: read all 10 questions. During the lecture: only write the answers — do not try to understand every word."),
            T("Check answers and categorise mistakes", "Which section is harder for you — 3 or 4? Write this in your notebook. Double your practice on the harder one next week."),
          ]
        },
        afternoon: {
          title: "Writing Task 1 — Line Graphs",
          subtasks: [
            T("Learn Simon's 4-part Task 1 structure for line graphs (20 min)", "Simon's structure — write it in your notebook: (1) Introduction — paraphrase the title in your own words, do NOT copy the question. (2) Overview — the 2-3 most important things you can see, NO specific numbers here. Simon says the overview is the most important sentence in the whole answer. (3) Body 1 — main details with specific numbers. (4) Body 2 — more details or a comparison. Find his line graph examples on ieltssimonfree.com."),
            T("Write the overview sentence for 3 different line graphs (20 min)", "Simon says the overview is the single most important part of Task 1 — and most students skip it or write it wrong. The overview says WHAT IS THE GENERAL TREND — not specific numbers. Example: 'Overall, sales increased steadily over the 10-year period, while costs remained relatively stable.' Always start with 'Overall,' or 'In general,'. Write the overview SECOND, after the introduction. Practise writing 3 overviews now."),
            T("Write your first full Task 1 answer — no time limit (25 min)", "Use a line graph from Cambridge IELTS (or generate one on Engnovate). Write all 4 parts using Simon's structure. After writing: (1) Count your words — did you reach 150? (2) Does your overview have NO specific numbers? (3) Did you use at least 3 different trend words? Then check your answer using the Engnovate Task 1 Writing Checker for AI feedback."),
          ]
        }
      },
      {
        day: 3,
        morning: {
          title: "Writing Task 1 Templates — Write These in Your Notebook",
          subtasks: [
            T("Write Simon's Task 1 Introduction Template in your notebook", "Simon's introduction template (from ieltssimonfree.com): 'The [graph/chart/diagram] shows [what it shows] [time period if given].' Example: 'The bar chart shows the number of students who studied abroad between 2010 and 2020.' This is a paraphrase of the question — never copy the question word for word. Write this template in your notebook. Memorise it."),
            T("Write Simon's Overview Template in your notebook", "Simon's overview template: 'Overall, it is clear that [main trend]. [Second main observation].' Example: 'Overall, it is clear that the number of students increased significantly over the period. Science was the most popular subject throughout.' Simon's rule: write this BEFORE your body paragraphs. Never include specific numbers in the overview. Write this template in your notebook and memorise it."),
            T("Write linking words for Task 1 in your notebook (20 min)", "Comparison: In contrast, Similarly, While, Whereas. Adding information: In addition, Furthermore, Also. Sequence (for processes/maps): First, Then, After that, Finally. Proportion: accounted for, made up, represented. Write these in your notebook and use at least 3 in every Task 1. They improve your coherence score without needing complex vocabulary."),
          ]
        },
        afternoon: {
          title: "Writing Task 2 — Introduction",
          subtasks: [
            T("Learn Simon's Writing Task 2 approach (20 min)", "Task 2 = write an essay of at least 250 words in 40 minutes. Simon's most important rules: (1) Task 2 is worth MORE marks than Task 1 — always write Task 2 first if you run out of time. (2) Plan for 5 minutes before you write — Simon says planning is not optional. (3) Never use complicated vocabulary to impress — use clear, accurate language. The examiner wants to understand your ideas, not decode them. Find his Task 2 lessons on ieltssimonfree.com."),
            T("Write Simon's 4-paragraph essay structure in your notebook (25 min)", "Simon uses exactly 4 paragraphs for every Task 2. Write this in your notebook: Paragraph 1 — Introduction (2 sentences: introduce the topic + give your opinion). Paragraph 2 — Body 1 (topic sentence + explain + example). Paragraph 3 — Body 2 (topic sentence + explain + example). Paragraph 4 — Conclusion (restate your view in 2 sentences). Simon's body paragraph formula: topic sentence → explain why → give an example. Write this structure and memorise it."),
            T("Write Simon's Introduction Template in your notebook", "Simon's introduction is simple and clear — 2 sentences only. Template: Sentence 1 — introduce the topic (paraphrase the question). Sentence 2 — give your position clearly. Example: 'People have different views about the role of technology in education. I believe that technology brings more benefits than drawbacks, and this essay will explain why.' Simon warns: do NOT write a long introduction. 2 sentences is enough. Write this in your notebook. Compare it with the Engnovate Speaking Part 1 structure — both use the same idea-first principle."),
          ]
        }
      },
      {
        day: 4,
        morning: {
          title: "Writing Task 1 Timed Practice + Section 4 Drill",
          subtasks: [
            T("Write a Task 1 answer in exactly 20 minutes (20 min)", "Set a timer. Use Simon's 4-part structure. Stop when the timer rings — even if you haven't finished. The goal is to practise writing quickly. After finishing: check the word count and submit your answer to the Engnovate Task 1 Checker for AI feedback on your structure, vocabulary, and grammar."),
            T("Do two Section 4 Listening practices back to back (35 min)", "Section 4 is the hardest. The only way to improve is to practise it often. After each practice: check your answers. Find where each correct answer was said in the audio."),
            T("Grammar practice: write 5 sentences using 'increased by' and 'rose to'", "Difference: 'increased BY' = how much it grew (increased by 20%). 'rose TO' = the final number (rose to 500). Write 5 sentences using each phrase. Check your grammar."),
          ]
        },
        afternoon: {
          title: "Writing Task 2 Body Paragraphs",
          subtasks: [
            T("Write Simon's Body Paragraph Template in your notebook", "Simon's formula — the same every time: 'One reason for this is that [reason]. For example, [specific example]. This shows that [connection to main point].' Simon's tip: the example must be SPECIFIC. Not 'many students use apps' but 'apps like Duolingo allow students to practise vocabulary at their own pace'. Specific examples push your score from Band 6 to Band 7. Write this template in your notebook."),
            T("Write Simon's Conclusion Template in your notebook", "Simon's conclusion is always short — 2 sentences maximum. Template: 'In conclusion, [restate your main argument in different words]. I therefore believe that [final thought or recommendation].' Simon's rule: the conclusion must NOT introduce any new ideas — it only summarises what you already said. Write this template in your notebook."),
            T("Write one full Task 2 essay — no time limit (40 min)", "Topic: 'Many people believe that technology has made our lives more complicated. Do you agree or disagree?' Step 1: plan for 5 minutes (write your 2 reasons and 1 example for each). Step 2: write using Simon's 4-paragraph structure. Step 3: check — is your opinion clear? Did you use specific examples? After writing, submit to the Engnovate Task 2 Checker for AI feedback."),
          ]
        }
      },
      {
        day: 5,
        morning: {
          title: "MOCK TEST 2 — Full Listening + Full Reading",
          subtasks: [
            T("MOCK TEST 2 — Full Listening, 4 sections, 45 minutes (45 min)", "Use a different test from Mock 1 — Cambridge IELTS or Jumpinto.com. Same rules: no pausing, no replaying. Apply Simon's method: use every pause to read the NEXT section's questions. After finishing, transfer to the answer sheet before checking anything."),
            T("MOCK TEST 2 — Full Reading, 3 passages, 60 minutes (60 min)", "Track your time strictly: move to Passage 2 after 20 minutes, even if you haven't finished. Apply Simon's locate-then-understand method. After completing: you can submit your answers to Engnovate's Reading test checker for instant feedback on which question types you struggle with most."),
            T("Score your test — compare to Mock 1 (15 min)", "Did your score improve? Write: Listening __ / 40, Reading __ / 40. Even 2-3 correct answers more than last week is progress."),
          ]
        },
        afternoon: {
          title: "Mock 2 Review + Speaking Introduction",
          subtasks: [
            T("Go through all wrong answers and find the reason (25 min)", "Same as Mock 1. Find the reason for each mistake. Is the same type of mistake appearing again? That is what you focus on next week."),
            T("Learn Simon's Speaking Part 1 approach (20 min)", "Part 1: the examiner asks 10-12 questions about familiar topics. Simon's key rule: give short, clear, direct answers. 2-4 sentences is perfect. Stop when you've answered — don't ramble. His formula: answer + one reason + stop. Do NOT try to impress the examiner with long, complicated answers. Find his Part 1 lessons on ieltssimonfree.com."),
            T("Write Simon's Speaking Part 1 template in your notebook (15 min)", "Simon's Part 1 formula: Answer + Reason + (optional) Example. Template: 'I [answer]. The reason for this is [reason]. For example, [example].' Example: 'Yes, I really enjoy cooking. The reason is that I find it very relaxing after a long day. For example, I often cook traditional dishes from my country at weekends.' Write this in your notebook. Then go to Jumpinto.com Speaking practice and try 5 Part 1 questions using this template."),
          ]
        }
      }
    ]
  },
  {
    week: 3,
    label: "Week 3",
    days: [
      {
        day: 1,
        morning: {
          title: "Listening — All Sections Review + Writing Task 1 Practice",
          subtasks: [
            T("Do Section 2 (map) and Section 4 practice (40 min)", "Focus on the two sections you find hardest. For Section 2 maps: read all labels BEFORE the audio. For Section 4: only focus on finding the answers — do not try to understand everything."),
            T("Write a Task 1 answer in exactly 20 minutes (20 min)", "Use a bar chart or pie chart. Use your templates. After writing: count your words. Did you write at least 150? Did you use an overview sentence?"),
            T("Read 3 Band 7 Task 1 sample answers on Engnovate (15 min)", "Go to engnovate.com → Band-9 IELTS Writing Samples. Notice what all good answers have in common: (1) a clear overview in the second paragraph, (2) data grouped by trend (not described one by one), (3) a variety of trend words. You can also find Simon's sample answers on ieltssimonfree.com. Copy one sentence structure you want to use in your own writing."),
          ]
        },
        afternoon: {
          title: "Speaking Part 2 — Cue Card Templates",
          subtasks: [
            T("Learn Simon's Speaking Part 2 approach (15 min)", "Part 2 is the most important part of the Speaking test. Simon says: treat it as your main performance. The examiner gives you a card with a topic and 3-4 bullet points. You have 1 minute to prepare — use every second. During your 1 minute: write keywords (NOT full sentences) for each bullet point. Then talk for 1-2 minutes without stopping. Simon's tip: it is OK to go slightly off-topic or even change details — the examiner is listening to HOW you speak, not whether every fact is true. Find his Part 2 lessons on ieltssimonfree.com."),
            T("Write a Simon-style Part 2 cue card template in your notebook (20 min)", "Topic: 'Describe something you own that is important to you.' Write keywords for each bullet point — not full sentences. Simon's preparation tip: during your 1 minute, just write 4-5 keywords per bullet point. Example bullet 'Why it is important': write 'memories, childhood, unique'. Then expand naturally when you speak. Write this template for 3 different objects you could describe."),
            T("Practise 3 cue card topics on Jumpinto — use the template (25 min)", "Go to Jumpinto.com → IELTS Speaking practice. Use your keyword notes from the template to guide your speaking — do NOT memorise it word for word. Speak naturally using the structure. Record your answer and check the AI feedback. Aim for 1.5-2 minutes without stopping. If you stop before 1.5 minutes: add more detail to the 'why' part of the answer."),
          ]
        }
      },
      {
        day: 2,
        morning: {
          title: "Writing Task 2 — Discussion Essays",
          subtasks: [
            T("Learn Simon's Discussion Essay structure (25 min)", "Discussion essays ask: 'Discuss both views and give your opinion.' Simon warns: you MUST give your OWN opinion too, not just describe both sides. His structure: Para 1: Introduction (name both views + your position). Para 2: First view + why people believe it + example. Para 3: Second view + your personal view on it + example. Para 4: Conclusion (state your final position clearly). Write this in your notebook. Find his discussion essay lessons on ieltssimonfree.com."),
            T("Write Simon's Discussion Essay Introduction Template in your notebook", "Simon's template: 'In today's world, there is much debate about [topic]. While some people believe [View 1], others argue that [View 2]. This essay will discuss both views and then explain why I believe [your position].' Simon says: state your position in the introduction — don't make the examiner wait until the conclusion to find out what you think. Write this in your notebook."),
            T("Write one full discussion essay — 40 minutes (40 min)", "Topic: 'Some people think children should start school as early as possible. Others think they should start at age 7. Discuss both views and give your opinion.' Use your templates. Write at least 250 words."),
          ]
        },
        afternoon: {
          title: "Reading — Multiple Choice + Timed Practice",
          subtasks: [
            T("Learn Multiple Choice strategy (20 min)", "Step 1: read the question carefully. Step 2: find the relevant part of the text (use keywords). Step 3: read that section carefully. Step 4: choose the option that matches. The wrong options often use words FROM the text — but in the wrong context. Never choose based on what sounds right — always check the text."),
            T("Do one Multiple Choice passage under time pressure (25 min)", "Time yourself. If you cannot find the answer in 2 minutes, move on. Come back at the end."),
            T("Do one FULL Reading passage — all 3 question types (25 min)", "A real IELTS passage mixes different question types. Practice switching between strategies."),
          ]
        }
      },
      {
        day: 3,
        morning: {
          title: "MOCK TEST 3 — Full Writing (Task 1 + Task 2)",
          subtasks: [
            T("Write Task 1 in exactly 20 minutes — use your template (20 min)", "Pick any Task 1 from a Cambridge IELTS book. Set your timer. Write Introduction + Overview + 2 Body Paragraphs. Stop at 20 minutes."),
            T("Write Task 2 in exactly 40 minutes — use your template (40 min)", "Pick any Task 2 from a Cambridge IELTS book. Set your timer. Use your 4-paragraph structure. Write at least 250 words. Stop at 40 minutes."),
            T("Self-check your writing (10 min)", "Check Task 1: Did you write an overview? Is it 150+ words? Check Task 2: Did you give a clear opinion? Is it 250+ words? Did you use linking words? Did you use academic vocabulary?"),
          ]
        },
        afternoon: {
          title: "Listening Intensive + Reading Timed Practice",
          subtasks: [
            T("Sections 3 and 4 back to back — stamina training (40 min)", "These are the hardest two sections. Simon says Section 4 is where most marks are lost. Doing them together builds the concentration you need for the real exam. After each section: note how many you got right and what type of mistake you made. Use Jumpinto.com or Cambridge IELTS books."),
            T("Do one full Reading passage timed — 20 minutes (20 min)", "Focus on the passage type that causes you the most mistakes. Check your answers and find why you got each one wrong."),
            T("Vocabulary: write 10 words from today's reading in your notebook", "Focus on academic words — the ones that appear in formal or scientific texts."),
          ]
        }
      },
      {
        day: 4,
        morning: {
          title: "Speaking Part 3 + Writing Task 2 Problem-Solution",
          subtasks: [
            T("Learn Simon's Speaking Part 3 approach (15 min)", "Part 3 is a deeper discussion connected to Part 2. The examiner asks about society, problems, and opinions. Simon's IEE method: Idea (your position) → Explain why → Example. For questions with two possible answers, Simon recommends starting with 'It depends...' — this gives you space to argue both sides naturally. Your answers should be 40-60 seconds. Find his Part 3 lessons on ieltssimonfree.com."),
            T("Write Simon's Part 3 template in your notebook and practise on Jumpinto (20 min)", "Simon's IEE template for Part 3: '[Your idea / position]. The reason I think this is [explanation]. For example, [specific example].' For problem-solution questions: 'I think one main reason for this is [reason]. A solution would be to [solution]. For example, [example].' Write both in your notebook. Then go to Jumpinto.com → Speaking Part 3 and practise with 3 different topics. Check the AI feedback after each answer."),
            T("Write Simon's Task 2 Problem-Solution Essay template in your notebook", "Simon's structure for problem-solution essays: Para 1 — Introduction (introduce the problem + say the essay will cover causes and solutions). Para 2 — Main cause(s) + a specific real-world example. Para 3 — Best solution(s) + a specific example. Para 4 — Conclusion (2 sentences). Simon's key reminder: every body paragraph needs a SPECIFIC example. 'Many people face housing problems' is not an example — 'In countries like Germany, the government subsidised social housing in the 1990s' is. Write this template in your notebook."),
          ]
        },
        afternoon: {
          title: "Writing Task 1 Maps and Processes",
          subtasks: [
            T("Learn how to describe a MAP in Task 1 (20 min)", "Maps show two versions of a place — before and after. Simon's approach: write what CHANGED and what STAYED THE SAME. Location words to write in your notebook: to the north of, next to, opposite, adjacent to, in the centre. Change words: was replaced by, was demolished, was constructed, has been extended, has remained unchanged. Study Simon's map examples on ieltssimonfree.com."),
            T("Write a Map Task 1 answer — 20 minutes (20 min)", "Overview: what is the main overall change? (e.g. 'Overall, the area became more developed with the addition of several new buildings.'). Body: changes in different areas of the map."),
            T("Learn how to describe a PROCESS in Task 1 (15 min)", "Processes show steps in a sequence. Simon's rule: always use PASSIVE voice for processes — 'The material is heated', 'The water is then filtered', 'The product is finally packaged.' Sequence words to write in your notebook: First, Then, After that, Next, Subsequently, Finally. Write an overview sentence for a process: 'Overall, the process involves [X] stages, beginning with [first step] and ending with [last step].'"),
          ]
        }
      },
      {
        day: 5,
        morning: {
          title: "MOCK TEST 4 — Full Listening + Full Reading",
          subtasks: [
            T("Do a FULL Listening test — 4 sections, 45 minutes (45 min)", "Third full mock. Compare your score to Mock 1 and Mock 2. Are you improving? Which section still needs the most work?"),
            T("Do a FULL Reading test — 3 passages, 60 minutes (60 min)", "Are you finishing all 3 passages in time now? If not, you need to read faster. Practice skimming — read only the first sentence of each paragraph to find where the answer is."),
            T("Write your scores and compare to previous mocks (10 min)", "Listening __ / 40, Reading __ / 40. Write the date and your score. Keep this record every week."),
          ]
        },
        afternoon: {
          title: "Mock 4 Review + Speaking Templates",
          subtasks: [
            T("Review all mistakes — find the root cause (25 min)", "For each wrong answer: is this the same type of mistake as before? If yes — you need to change your approach, not just practise more."),
            T("Write 5 cue card templates in your notebook and practise on Jumpinto (25 min)", "Topics: a person you admire, a place you visited, a skill you have learned, a book you read, a challenge you faced. For each: write Simon-style keywords for each bullet point (not full sentences). Then practise on Jumpinto.com → Speaking Part 2. Aim for 1.5-2 minutes per topic. Use the AI feedback to check your fluency and vocabulary range."),
            T("Practise 5 Part 1 topics on Jumpinto (15 min)", "Topics: your hometown, your studies or work, your hobbies, technology, transport. For each: use Simon's formula — Answer + Reason + Example. Speak clearly and naturally. Simon's reminder: you do NOT need difficult vocabulary in Part 1. The examiner is listening for fluency, not complexity. Check Jumpinto's AI feedback after each answer."),
          ]
        }
      }
    ]
  },
  {
    week: 4,
    label: "Week 4",
    days: [
      {
        day: 1,
        morning: {
          title: "Advanced Listening — Distractors + Section 4",
          subtasks: [
            T("Deep study: DISTRACTORS in Listening (20 min)", "Simon covers distractors in every listening lesson. A distractor is information that sounds like the answer but is not. Example: 'The tour starts at 10am... actually, it was moved to 11am.' The answer is 11am. RULE: always wait until the speaker finishes the complete idea before writing. Review Simon's distractor examples on ieltssimonfree.com — this is one of the highest-value lessons for Section 3."),
            T("2 Section 3 tests on Jumpinto — mark every distractor you find (40 min)", "Use Jumpinto.com for Section 3 practice with AI scoring. After each test: go back and find every place where the speaker said the wrong answer first before correcting it. How many distractors did you catch? The more you train yourself to notice them, the less they will trick you in the exam."),
            T("2 Section 4 tests back to back — stamina training (35 min)", "Section 4 is often where Band 6 candidates lose points. Two lectures in a row is harder than the real exam — which means one lecture will feel easier by comparison. Use Cambridge IELTS or Jumpinto.com. After both: record your scores (out of 10 each). Is the second score lower than the first? If yes: your concentration is fading — practise holding focus longer."),
          ]
        },
        afternoon: {
          title: "Writing Task 2 — Two-Part Questions + Vocabulary",
          subtasks: [
            T("Learn Two-Part Question essays (20 min)", "These questions ask two things: e.g. 'Why does this happen? What can be done about it?' You MUST answer BOTH parts. Structure: Para 2 = answer Part 1. Para 3 = answer Part 2. Write a Two-Part Essay Template in your notebook: 'There are several reasons why [Part 1 answer]. However, there are also practical steps that can be taken to address this issue [Part 2 answer].'"),
            T("Write one full Two-Part Essay — 40 minutes (40 min)", "Topic: 'More and more people are choosing to live alone. Why is this happening? What are the effects on society?' Write at least 250 words. Use your template."),
            T("Vocabulary upgrade — replace simple words in your essay (15 min)", "Simon's advice: never try to impress with rare words. Instead, use accurate, clear academic words consistently. Replace: good → beneficial, bad → harmful, big → significant, many → numerous, show → demonstrate, think → believe, help → support. Rewrite 5 sentences from your essay. Then check the improved version with the Engnovate Task 2 Checker to see if the vocabulary score changes."),
          ]
        }
      },
      {
        day: 2,
        morning: {
          title: "Reading — Speed Training",
          subtasks: [
            T("Speed reading drill — 3 passages in 50 minutes (50 min)", "This is HARDER than the real exam (60 minutes normally). You will probably not finish. That is the point — being under extra pressure in training makes the real exam feel easier. Try your best."),
            T("Which question type is still causing the most mistakes? (15 min)", "Look at your error log from all 4 mocks. What type of question do you get wrong most often? Write: 'My weakest question type is ___.' That is your target for the rest of this week."),
            T("Vocabulary: write 15 words for social issues topics (20 min)", "Topics that come up often in Reading and Task 2: climate change, education, technology, health, work. Learn: sustainable, affordable, inequality, awareness, policy, impact, solution, consequence, beneficial, challenge. Write them in your notebook with a sentence for each."),
          ]
        },
        afternoon: {
          title: "Speaking — All Three Parts Practice",
          subtasks: [
            T("Write Simon's Part 3 opinion starters in your notebook (15 min)", "Simon's starter phrases for Part 3: 'I think the main reason for this is...' / 'From my point of view...' / 'It depends on the situation, but generally I believe...' / 'There are advantages and disadvantages, but overall...' The 'it depends' opener is one of Simon's favourite techniques — it gives you time to think and structure a two-sided answer. Write all of these in your notebook. Practise on Jumpinto.com Speaking Part 3."),
            T("Write Part 3 templates for 3 common topics and practise on Jumpinto (20 min)", "Topics: education, technology, environment. For each: write a 3-sentence response using Simon's IEE formula (Idea + Explain + Example). Then go to Jumpinto.com Speaking Part 3 and practise each template out loud — aim for 40-60 seconds per answer. Use the AI feedback to check if your answers are developed enough. Also join the Discord today and find a speaking partner to practise these topics live for 20-30 minutes."),
            T("Pronunciation practice on Engnovate (20 min)", "Go to engnovate.com → Pronunciation exercises. Work on the words you find hardest. Simon's rule: you do NOT need a British or American accent — you need to be EASY TO UNDERSTAND. Focus on clear syllables, not accent. Common difficult words: comfortable (3 syllables: COMF-ta-ble), environment, particularly, especially, government. Say each one slowly, then at normal speed."),
          ]
        }
      },
      {
        day: 3,
        morning: {
          title: "MOCK TEST 5 — Full Listening + Full Reading",
          subtasks: [
            T("Do a FULL Listening test — 45 minutes (45 min)", "Fifth mock. Focus especially on your weakest section. Are your Section 4 scores improving?"),
            T("Do a FULL Reading test — 60 minutes (60 min)", "Are you finishing Passage 3 now? Passage 3 is the hardest — practise reading the questions first, then scan the passage for the answers."),
            T("Score and track — write in your notebook (10 min)", "Date: ___ / Listening: __ / 40 / Reading: __ / 40. You now have 5 mocks on record. Can you see a pattern of improvement?"),
          ]
        },
        afternoon: {
          title: "Writing Mock Review + Grammar Focus",
          subtasks: [
            T("Review your best Task 2 essay from this week — improve it (25 min)", "Take the essay you wrote this week. Make it better: improve one weak sentence in each paragraph. Replace 3 basic words with better vocabulary. Add one more complex sentence."),
            T("Grammar: complex sentences with 'Although' and 'Despite' (25 min)", "These make your writing more academic. 'Although technology is useful, it can also be distracting.' / 'Despite the benefits of exercise, many people struggle to find time for it.' Write 5 sentences using 'Although' and 5 using 'Despite'. Check your grammar carefully."),
            T("Write a grammar error list in your notebook (10 min)", "What grammar mistakes do you make often? Common ones: forgetting 's' in third person (he goes, not he go), mixing up 'the' and 'a', wrong verb tense. Write them down so you remember to check for them."),
          ]
        }
      },
      {
        day: 4,
        morning: {
          title: "MOCK TEST 6 — Full 4-Skill Practice Day",
          subtasks: [
            T("Do a FULL Listening test — 45 minutes (45 min)", "This is your sixth mock. Treat it like the real exam — sit in a quiet room, no distractions, no phone."),
            T("Do a FULL Reading test — 60 minutes (60 min)", "After reading, go directly to Writing without a long break. This is how the real exam works."),
            T("Write Task 1 in 20 minutes + Task 2 in 40 minutes (60 min)", "First full Writing mock. Use your templates. Check word count at the end: Task 1 must be 150+ words, Task 2 must be 250+ words."),
          ]
        },
        afternoon: {
          title: "Mock 6 Full Review",
          subtasks: [
            T("Score all 4 skills and write in your notebook (15 min)", "Listening __ / 40, Reading __ / 40, Writing __ (self-assess), Speaking __ (self-assess if you practised). This is your most complete picture so far."),
            T("Deep review: find your 3 most common mistake types (25 min)", "Go through all 6 mocks. What are the 3 mistakes you make most often? Write them clearly in your notebook: 'Mistake 1: ___, Mistake 2: ___, Mistake 3: ___'. These are your final targets."),
            T("Plan your last week — what needs the most improvement? (10 min)", "You have 1 week left. Be honest. What is your weakest skill? What one change would improve your score the most? Write a specific plan for Week 5."),
          ]
        }
      },
      {
        day: 5,
        morning: {
          title: "Targeted Practice — Your Weakest Area",
          subtasks: [
            T("3 hours of focused practice on your weakest skill (180 min)", "Weakest at Section 4? Do 4 practices back to back. Weakest at Task 2 vocabulary? Write 3 introduction paragraphs with better words. Weakest at Passage 3? Do 4 timed Passage 3 practices. Go deep on ONE thing."),
            T("Compare your performance to 2 weeks ago", "Do the same type of task you practised 2 weeks ago. Did your score or speed improve? Write the result in your notebook."),
            T("Review all templates in your notebook (20 min)", "Read through: Task 1 templates, Task 2 templates, Speaking Part 1, 2, and 3 templates. Make sure you know them well."),
          ]
        },
        afternoon: {
          title: "MOCK TEST 7 — Full Writing + Full Speaking Practice",
          subtasks: [
            T("Write Task 1 in 20 minutes + Task 2 in 40 minutes (60 min)", "Your second full Writing mock. Use your templates. Compare to Mock 6 Writing — is it better?"),
            T("Speaking practice — all 3 parts on JumpInto (30 min)", "Go to JumpInto.com. Practise: 5 Part 1 questions (2-3 sentences each), 2 cue card topics (1.5-2 minutes each), 3 Part 3 questions (40-60 seconds each). Focus on using your templates naturally."),
            T("Write down 3 improvements you notice since Week 1 (10 min)", "Look at your Week 1 work and your work today. What has clearly improved? Seeing your progress keeps you motivated."),
          ]
        }
      }
    ]
  },
  {
    week: 5,
    label: "Week 5",
    days: [
      {
        day: 1,
        morning: {
          title: "Final Push — Weakest Skill Focus",
          subtasks: [
            T("2 hours of targeted practice on what you still find hardest (120 min)", "You know your weakest area by now. Use these 2 hours entirely for that. Examples: if it is Section 4 — do 3 Section 4 practices. If it is Task 2 — write 2 full essays using different templates. If it is Reading speed — do 4 timed Passage 3 exercises."),
            T("Review your common mistake list from your notebook (20 min)", "Read your list of most common mistakes. Are you still making them? Focus specifically on NOT making these mistakes in your last 3 mocks."),
            T("Do one more Section 4 practice to build confidence (20 min)", "Section 4 is often the decider between Band 6 and Band 7 in Listening. Keep practising."),
          ]
        },
        afternoon: {
          title: "Speaking Full Practice + Writing Review",
          subtasks: [
            T("Write 5 more cue card templates and practise on Jumpinto (30 min)", "New topics: a skill you want to learn, a trip you would like to take, a famous person you admire, a meal you enjoy, a time you helped someone. For each: write Simon-style keywords for each bullet point. Practise on Jumpinto.com — aim for 1.5 minutes per topic. After each practice, check the AI feedback. Make a note of any vocabulary the AI suggests."),
            T("Review your best Task 2 essay — make it better (25 min)", "Find the best essay you wrote this month. Read it again. Improve: the introduction (is your opinion clear?), one body paragraph (add a better example), and the conclusion (does it summarise your point?)."),
            T("Write your personal vocabulary list — the 50 words you will use in the exam (20 min)", "Look through your notebook. Choose the 50 most useful academic words you have learned. Write them on one page. Read this page every morning this week."),
          ]
        }
      },
      {
        day: 2,
        morning: {
          title: "MOCK TEST 8 — Full 4-Skill Simulation",
          subtasks: [
            T("MOCK TEST 8 — Full Listening, 45 minutes, exam conditions (45 min)", "Eighth mock. Sit in a quiet room. No distractions. Apply all of Simon's techniques: read ahead during pauses, wait for final answers before writing, underline keywords before the audio starts. Use Jumpinto.com for AI-scored feedback or Cambridge IELTS books."),
            T("MOCK TEST 8 — Full Reading, 60 minutes, immediately after Listening (60 min)", "In the real exam, Reading comes directly after Listening. Practise this now. Apply Simon's locate-then-understand method. Track your time per passage."),
            T("MOCK TEST 8 — Writing Task 1 + Task 2, immediately after Reading (60 min)", "Full simulation: tired brain + time pressure = the best preparation. Use Simon's 4-part structure for Task 1 and 4-paragraph structure for Task 2. Plan Task 2 for 5 minutes before writing. After finishing, submit your Task 2 to Engnovate's Writing Checker."),
          ]
        },
        afternoon: {
          title: "Mock 8 Review + Final Exam Prep",
          subtasks: [
            T("Score all skills and compare to your first mock (20 min)", "Compare Mock 8 (today) to Mock 1 (Week 1 Day 5). How much have your scores improved? Write this down."),
            T("Write your EXAM DAY STRATEGY in your notebook (25 min)", "Write down: (1) How will you manage time in Listening? (2) How will you manage time in Reading? (3) What will you do first in Task 1? (4) What will you do first in Task 2? (5) How will you handle a question you do not know? Reading this before the exam keeps you calm."),
            T("Review all templates one final time (15 min)", "Read through all your templates: Task 1, Task 2, Speaking Part 1, 2, 3. These are your tools. Know them well."),
          ]
        }
      },
      {
        day: 3,
        morning: {
          title: "Light Review — 3 Days Before Exam",
          subtasks: [
            T("Do Section 1 and Section 2 only — easy warm-up (35 min)", "Easy practice to keep your brain active without tiring yourself. Do NOT study intensively in the last 3 days. Maintain sharpness — do not exhaust yourself."),
            T("Read one interesting article in English — no questions (20 min)", "Read something you enjoy in English. This keeps your reading speed active without the stress of a test. Choose BBC News, National Geographic, or any article you find interesting."),
            T("Read your vocabulary list — the 50 words you wrote (15 min)", "Read through your top 50 words. You are not learning them now — you are reminding yourself of words you already know."),
          ]
        },
        afternoon: {
          title: "Speaking Confidence + Final Writing",
          subtasks: [
            T("Practise 10 cue card topics on Jumpinto — no notes (30 min)", "By now you should be able to speak for 1.5-2 minutes on any topic without looking at notes. Use Simon's keyword structure in your head — not the exact words. Then join the Discord and spend 30 minutes speaking with a partner about 3-4 of these same topics. Real human conversation is irreplaceable for building fluency."),
            T("Write one final Task 2 essay on a topic you have NOT practised before (35 min)", "This tests whether you can adapt your skills to a new question. Choose a random topic from a Cambridge IELTS book. Write it in 40 minutes using your template."),
            T("Speak English for 20 minutes on Jumpinto or Discord (20 min)", "Option 1: go to Jumpinto.com and use the AI conversation feature — talk about your day, your plans, or a topic you know well. Option 2: join the Discord and have a free conversation with a partner. Either way: keep talking. Don't stop to translate in your head. The goal is fluency and confidence, not perfection."),
          ]
        }
      },
      {
        day: 4,
        morning: {
          title: "Exam Eve — Very Light Review Only",
          subtasks: [
            T("Read your exam-day strategy from your notebook (15 min)", "Read through the strategy you wrote. It is now complete. Trust it."),
            T("Listen to 20 minutes of natural English (20 min)", "Watch a short YouTube video, a podcast, or a documentary in English. Something you enjoy. This keeps your listening skills active without stress."),
            T("Prepare everything for exam day (15 min)", "Lay out: your ID document, directions to the test centre, the arrival time (be there 30 minutes early), a bottle of water. Remove all logistical stress from tomorrow."),
          ]
        },
        afternoon: {
          title: "Rest + Mental Preparation",
          subtasks: [
            T("Read your top 20 vocabulary words and 3 template starters (15 min)", "Quick, positive review. Focus on your BEST phrases — the ones you feel most confident using."),
            T("Close your eyes and visualise the exam going well (10 min)", "Imagine each section: you are calm, you understand the questions, you write clearly. Sportspeople use this technique before competitions. It works."),
            T("Sleep 8 hours — this is the most important preparation for tomorrow", "Your brain consolidates everything you have learned during sleep. Going to bed early is one of the most effective things you can do the night before the exam."),
          ]
        }
      },
      {
        day: 5,
        morning: {
          title: "EXAM DAY — Final Warm-Up + MOCK TEST 9",
          subtasks: [
            T("Read one short article to activate your English (15 min)", "Read something simple and clear in English. This warms up your brain like a warm-up run before a race."),
            T("Read your Task 1 and Task 2 starter phrases one final time (10 min)", "'The [chart] shows...' and 'In today's world...' — your first words are ready."),
            T("MOCK TEST 9 — Full Listening + Full Reading (105 min)", "Full Listening (45 min) + Full Reading (60 min). Exam conditions. Apply every technique: read ahead in Listening, locate-then-understand in Reading. Use Jumpinto.com for AI feedback or Cambridge IELTS books."),
          ]
        },
        afternoon: {
          title: "MOCK TEST 10 + Post-Exam Reflection",
          subtasks: [
            T("MOCK TEST 10 — Full Writing + Speaking (90 min)", "Task 1 (20 min, Simon's 4-part structure) + Task 2 (40 min, plan 5 min then write) + Speaking on Jumpinto (30 min: Part 1 + Part 2 + Part 3, full simulation). Your final complete 4-skill mock. Use every technique you have learned. Submit your Task 2 to Engnovate for a final AI check."),
            T("Write down everything you remember — questions, topics, timing (30 min)", "Do this while memory is fresh. If you retake the exam, this record is very valuable."),
            T("Celebrate completing 25 days of serious preparation", "You have completed a full structured programme. Regardless of the result — the discipline and effort you showed is something to be genuinely proud of."),
          ]
        }
      }
    ]
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// PLAN B — 2-MONTH STANDARD (8 weeks, 25 full mock tests, Band 7.0+, 3-4h/day)
// Months: Month 1 = Weeks 1-4, Month 2 = Weeks 5-8
// Retakers: jump straight to Week 5 (Month 2)
// ─────────────────────────────────────────────────────────────────────────────
export const standardPlan = [
  {
    week: 1, label: "Month 1 · Week 1",
    days: [
      { day: 1,
        morning: { title: "Listening — Full Format + Section 1 & 2 Basics",
          subtasks: [
            T("Watch Simon's complete Listening overview + do Section 1 practice (45 min)", "Go to ieltssimonfree.com → Listening lessons. Watch Simon's overview of all 4 sections. His most important rule for the whole test: use every pause between sections to read the NEXT section's questions — never look back. Write in your notebook: Section 1 = everyday conversation. Section 2 = one person, practical topic (often maps). Section 3 = academic discussion (most distractors here). Section 4 = academic lecture, no pause, read all questions first. Then do one Section 1 practice on Jumpinto.com."),
            T("Do Section 1 practice — spelling and numbers focus (30 min)", "Use Cambridge IELTS Book 13, 14, or 15. After the test: check your answers. Write down every spelling mistake you made. These same mistakes will come up again — fix them now."),
            T("Write 12 new vocabulary words in your notebook (20 min)", "From today's listening: write each new word, what it means, and one sentence using it."),
          ]
        },
        afternoon: { title: "Reading — All Question Types (Overview)",
          subtasks: [
            T("Study the 8 most common Reading question types with Simon's strategies (40 min)", "Study these on ieltssimonfree.com (Reading section): (1) True/False/Not Given — only use what the text says. (2) Yes/No/Not Given — about the author's opinion. (3) Matching Headings — read first sentence of each paragraph only. (4) Matching Information — check all paragraphs, no set order. (5) Summary Completion — answers come word-for-word from text. (6) Sentence Completion — check word type and meaning. (7) Multiple Choice — eliminate wrong options. (8) Short Answer — stay within the word limit. Write Simon's strategy for each type in your notebook."),
            T("Simon's skimming method — main idea only (20 min)", "Simon's rule: the first sentence of each paragraph contains the main idea. Practise now with 3 different passages on Engnovate. Read ONLY the first sentence of each paragraph. Write the main idea of the whole passage in 1 sentence. You should finish all 3 passages in under 8 minutes. This is the foundation of Simon's locate-then-understand approach — you locate before you read carefully."),
            T("Academic Word List — 20 essential words for Reading and Writing (20 min)", "These appear in almost every IELTS passage and essay: analyse, assess, concept, context, data, define, factor, indicate, method, occur, process, require, response, role, section, significant, source, structure, theory, vary. Write them in your vocabulary notebook with one example sentence each. Then add them to your Engnovate flashcard deck to review them daily."),
          ]
        }
      },
      { day: 2,
        morning: { title: "Listening — Spelling + Numbers Drills",
          subtasks: [
            T("Section 1 drill — numbers, dates, and spelling (35 min)", "The most common Section 1 mistakes: writing 13 when you hear 30. Say them aloud: 'thirTEEN' (stress at the end) vs 'THIRty' (stress at the start). Also practise dates: 'the 15th of March' = 15 March. And spelling: accommodation, necessary, environment must be perfect. Drill on Jumpinto.com Section 1 practice until you get 100% on these."),
            T("Spelling correction — write these 10 words 5 times each (20 min)", "Most commonly misspelled in IELTS: accommodation, necessary, environment, government, temperature, development, communication, independent, international, opportunity. Spell them correctly. If you get one wrong: write it 5 more times."),
            T("Section 2 map practice — read ALL labels before pressing play (30 min)", "Before the audio: look at the map and read every label. Predict what the speaker might describe. Then press play. Did your predictions help?"),
          ]
        },
        afternoon: { title: "Reading — True/False/Not Given (In Depth)",
          subtasks: [
            T("Study True/False/Not Given with 6 examples (35 min)", "The critical rule: NOT GIVEN = the text simply does not mention this topic. It is NOT the same as False. If you cannot find the topic anywhere in the text — it is NOT GIVEN. Work through 6 examples. For each one: find the exact sentence in the text that justifies your answer."),
            T("Do 2 sets of T/F/NG questions timed (30 min)", "Time yourself. After finishing: for every wrong answer, find the exact line in the text that proves what the correct answer should be."),
            T("Write 8 new words from today's reading in your notebook", "Choose the words you did not know before today."),
          ]
        }
      },
      { day: 3,
        morning: { title: "Listening — Sections 3 & 4 Introduction",
          subtasks: [
            T("Deep study: distractors in Listening — Simon's warning (20 min)", "Simon says distractors are deliberate — the test is designed to trick you. The speaker says the wrong answer first, then corrects it. Example: 'The meeting is Monday... actually, it was moved to Wednesday.' The answer is Wednesday. RULE: always wait until the speaker finishes the complete thought. Write 'WAIT FOR THE FINAL ANSWER' in your notebook and underline it three times. Review Simon's distractor lessons on ieltssimonfree.com."),
            T("Do Section 3 practice — focus on distractors (30 min)", "After the test: go through the audio again. Find every distractor. Write them down. How many did you catch?"),
            T("Do Section 4 practice — one academic lecture (25 min)", "Before pressing play: read all 10 questions. During the lecture: do NOT try to understand everything — only listen for the specific answers. Write quickly and move on."),
          ]
        },
        afternoon: { title: "Reading — Matching Headings (Step by Step)",
          subtasks: [
            T("Learn Matching Headings with 4 examples (25 min)", "Step 1: Read ALL headings before touching the passage. Step 2: For each paragraph — read ONLY the first sentence and the last sentence. Step 3: Match the heading to the main idea. Step 4: Cross out headings you have already used. Write this 4-step process in your notebook."),
            T("Do 2 Matching Headings passages — one untimed, one in 15 minutes (40 min)", "The untimed one: focus on getting it right. The timed one: focus on speed. Compare your accuracy — does speed affect your score?"),
            T("Vocabulary: write 10 academic words connected to science or research (20 min)", "Words to know: hypothesis, evidence, analysis, conclusion, method, data, significant, indicate, demonstrate, suggest. Write each with a sentence."),
          ]
        }
      },
      { day: 4,
        morning: { title: "Writing Task 1 — Introduction + Templates",
          subtasks: [
            T("Learn Simon's approach for all 4 Task 1 types — write templates in your notebook (35 min)", "Study all 4 types on ieltssimonfree.com (Writing Task 1 section). Type 1 — LINE GRAPH: trends over time, use overview with no numbers. Type 2 — BAR/PIE CHART: compare highest and lowest, group similar data. Type 3 — MAP: say what changed and what stayed the same, use location words. Type 4 — PROCESS: use passive voice and sequence words throughout. For EACH type: write Simon's introduction template in your notebook. Use the same template every time — consistency saves time in the exam."),
            T("Memorise Simon's Introduction and Overview templates (25 min)", "Simon says these are the two most important sentences in Task 1. Introduction: 'The [graph/chart] shows [what it shows] [time period].' Overview: 'Overall, it is clear that [main trend]. [Second main finding].' Simon's rule: write the overview BEFORE the body paragraphs. The overview has NO specific numbers — only the general pattern. Memorise both templates. Then practise writing them for 3 different graph types. Use Engnovate's Task 1 Generator to create practice graphs."),
            T("Write Trend Words in your notebook (20 min)", "UP: rose, increased, grew, climbed, soared. DOWN: fell, dropped, decreased, declined, plummeted. STABLE: remained stable, stayed at the same level, showed little change. PEAK: reached a peak of, peaked at. Write an example sentence for each."),
          ]
        },
        afternoon: { title: "Reading — Summary Completion + Sentence Completion",
          subtasks: [
            T("Learn Summary Completion (20 min)", "The summary is a paraphrase of a section of the text. The answers come WORD FOR WORD from the text — do not paraphrase. Steps: (1) Read the summary. (2) Find which part of the text the summary is about. (3) Find the exact words that fill each gap. (4) Check: does the word fit grammatically? Is it within the word limit?"),
            T("Learn Sentence Completion (20 min)", "Same as Summary Completion — answers come from the text. But now each sentence must make grammatical sense. Before looking for the answer: decide what TYPE of word you need (noun? verb? adjective?) and what MEANING you expect."),
            T("Do one practice passage with both question types (35 min)", "A real IELTS passage will mix question types. Practise switching between strategies in one session."),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 1 — Full Listening + Full Reading",
          subtasks: [
            T("Do a FULL Listening test — 4 sections, 45 minutes (45 min)", "Your first full mock. Sit in a quiet place. No pausing. No replaying. Write on paper, then transfer to the answer sheet at the end. This is exactly how the real test works."),
            T("Do a FULL Reading test — 3 passages, 60 minutes (60 min)", "20 minutes per passage. If you run out of time on Passage 2, move to Passage 3 — do not spend more than 22 minutes on any passage."),
            T("Score your test: Listening __ / 40, Reading __ / 40", "Write your scores in your notebook with today's date. This is your Month 1 starting point."),
          ]
        },
        afternoon: { title: "Mock 1 Review + Writing Task 1 Practice",
          subtasks: [
            T("Review all wrong answers — find the reason for each (30 min)", "Go through each mistake. Was it: not hearing it / spelling / misreading the question / running out of time? Write the reason. Count how many of each type. Your most common type = your Week 2 focus."),
            T("Write a full Task 1 answer for a bar chart — no time limit (30 min)", "Use your templates. Write Introduction + Overview + 2 Body Paragraphs. Count your words: 150+ required. Check: Did you write an overview? Did you group similar data together?"),
            T("Watch one Band 7 Task 1 example video on YouTube (20 min)", "Search 'IELTS Writing Task 1 Band 7 example'. Notice: always starts with a paraphrase (not a copy). Always has an overview. Groups data — does not list every number one by one."),
          ]
        }
      }
    ]
  },
  { week: 2, label: "Month 1 · Week 2",
    days: [
      { day: 1,
        morning: { title: "Writing Task 1 — Graphs and Charts Timed Practice",
          subtasks: [
            T("Write a line graph Task 1 in exactly 20 minutes (20 min)", "Set your timer. Use your templates. Stop at 20 minutes. Check: Did you use an overview? Did you write 150+ words? Did you use at least 3 different trend words?"),
            T("Write a bar chart Task 1 in exactly 20 minutes (20 min)", "For bar charts: compare the HIGHEST and LOWEST values first in your overview. Then describe the key differences between categories. Do NOT describe every single bar — select the most important ones."),
            T("Write comparison vocabulary in your notebook (20 min)", "Phrases for comparing: 'X was significantly higher than Y.' 'The figures for X and Y were almost identical.' 'There was a large gap between X and Y.' 'X accounted for the largest share at 45%.' Write these in your notebook and use them in every Task 1."),
          ]
        },
        afternoon: { title: "Listening — Weak Section Intensive",
          subtasks: [
            T("Do 3 practices of your weakest section from Mock 1 (45 min)", "Which section caused the most mistakes in Mock 1? Do 3 practices of THAT section specifically. For each one: check answers, find the reason for every mistake, keep a tally."),
            T("Reading — Matching Information practice (30 min)", "Strategy: underline the key idea in each question. Then scan EVERY paragraph — not just the first ones. The question order does NOT match the text order."),
            T("Vocabulary: write 10 words for common Task 2 topics (20 min)", "Environment: sustainable, pollution, renewable. Education: curriculum, qualification, literacy. Technology: digital, artificial intelligence, innovation. Health: sedentary, obesity, well-being."),
          ]
        }
      },
      { day: 2,
        morning: { title: "Writing Task 2 — Full Structure + Templates",
          subtasks: [
            T("Learn the 5 Task 2 essay types and write templates for all 5 (45 min)", "Type 1 — OPINION ('Do you agree or disagree?'): give YOUR view clearly. Type 2 — DISCUSSION ('Discuss both views'): write about both sides. Type 3 — PROBLEM-SOLUTION: write about causes and solutions. Type 4 — ADVANTAGES-DISADVANTAGES: discuss pros and cons. Type 5 — TWO-PART ('Why? + What?'): answer both questions. Write a TEMPLATE for each type in your notebook — including a starter phrase for each."),
            T("Write 5 Introduction Templates in your notebook — one for each type (30 min)", "Each introduction must: (1) paraphrase the question (use different words — do NOT copy), (2) give your view or say what the essay will cover. Starter phrases: 'In today's world...' / 'One of the most pressing issues in modern society is...' / 'It is widely debated whether...' Write all 5 in your notebook."),
            T("Write a Conclusion Template in your notebook (15 min)", "Template: 'In conclusion, [restate your main point]. It is clear that [final thought]. Therefore, [recommendation or implication].' Write this and memorise it. You will use it in EVERY essay."),
          ]
        },
        afternoon: { title: "Speaking Part 1 + Templates",
          subtasks: [
            T("Learn the Speaking test format (20 min)", "Part 1 (4-5 min): personal questions about familiar topics. Part 2 (3-4 min): speak alone about a given topic for 1-2 minutes. Part 3 (4-5 min): deeper discussion on the Part 2 topic. Write this structure in your notebook."),
            T("Write Simon's Part 1 template and practise on Jumpinto (20 min)", "Simon's Part 1 formula: Answer + Reason + (optional) Example. Stop after that — do not ramble. Template: 'Yes, I [answer]. The main reason is [reason]. For example, [example].' Practise on Jumpinto.com Speaking Part 1 with 5 different questions. Check the AI feedback after each answer."),
            T("Write Part 1 templates for 5 topics and practise on Jumpinto (30 min)", "Topics: your hometown, your studies or work, hobbies, food, travel. For each: write a 3-sentence answer using Simon's formula (Answer + Reason + Example). Then go to Jumpinto.com Speaking Part 1 and speak the answers — do not read them. Use the structure in your head. After practising all 5: join the Discord and talk about 2-3 of these same topics with a real person for 20 minutes."),
          ]
        }
      },
      { day: 3,
        morning: { title: "MOCK TEST 2 — Full Listening + Full Reading",
          subtasks: [
            T("Do a FULL Listening test — 45 minutes (45 min)", "Compare to Mock 1. Did your weakest section improve? Write: Mock 2 Listening __ / 40. Difference from Mock 1: __."),
            T("Do a FULL Reading test — 60 minutes (60 min)", "Did you finish all 3 passages this time? Track your time per passage."),
            T("Score and compare to Mock 1 (15 min)", "Write: Mock 2 scores. Improvement: __ points in Listening, __ points in Reading. Most students improve 2-5 points between Mock 1 and Mock 2."),
          ]
        },
        afternoon: { title: "Mock 2 Review + Week 3 Planning",
          subtasks: [
            T("Review all mistakes — update your error log (30 min)", "Are the same mistakes appearing again? Write: 'Repeat mistake: ___'. If the same type appears twice — it is your priority for Week 3."),
            T("Write a full Task 2 Opinion Essay in 40 minutes (40 min)", "Topic: 'Some people believe working from home is more productive. Others think the office is better. Do you agree or disagree?' Use your template. 250+ words."),
            T("Check your essay for these specific errors (15 min)", "Check: (1) Is your opinion clear in the introduction? (2) Does every body paragraph have a reason AND an example? (3) Is the conclusion different from the introduction?"),
          ]
        }
      },
      { day: 4,
        morning: { title: "Writing Task 1 — Maps and Processes",
          subtasks: [
            T("Write Map Task 1 templates in your notebook (20 min)", "Introduction: 'The maps show [place] in [year 1] and [year 2].' Overview: 'Overall, the most significant change was [main change]. [Other notable change].' Location words to write in your notebook: to the north of, to the south of, in the centre, adjacent to, opposite, next to. Change words: was replaced by, was demolished, was constructed, has been extended, has remained unchanged."),
            T("Write a full Map Task 1 in 20 minutes (20 min)", "Use the Cambridge IELTS book. Set your timer. Use your template and location words."),
            T("Write Process Diagram templates in your notebook (20 min)", "Introduction: 'The diagram illustrates the process of [what].' Overview: 'Overall, the process involves [number] stages, beginning with [first step] and ending with [last step].' Key rule: use PASSIVE VOICE for processes — 'The material IS heated', 'The liquid IS filtered'. Write the passive forms in your notebook."),
          ]
        },
        afternoon: { title: "Reading — Multiple Choice + Speed Training",
          subtasks: [
            T("Multiple Choice strategy and practice (30 min)", "Wrong answers in multiple choice often USE WORDS from the text — but in the wrong way. Always find the specific line in the text that justifies your answer. Never guess from memory."),
            T("Speed training: 2 passages in 35 minutes (35 min)", "This is harder than the real exam (20 min per passage normally). Push yourself. After finishing: did you finish both passages? How many did you get right?"),
            T("Vocabulary: 15 words for writing topics (20 min)", "Add to your notebook: healthcare, urbanisation, globalisation, inequality, conservation, legislation, initiative, implement, benefit, consequence, factor, issue, trend, concern, approach."),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 3 — Full Writing (Task 1 + Task 2)",
          subtasks: [
            T("Write Task 1 in exactly 20 minutes — bar chart or line graph (20 min)", "Use your template. Stop at 20 minutes regardless of whether you have finished. This is how the exam works."),
            T("Write Task 2 in exactly 40 minutes — discussion essay (40 min)", "Topic: 'Some people think public transport is better than private cars. Others prefer to own a car. Discuss both views and give your own opinion.' 250+ words. Use your template."),
            T("Self-check your writing (15 min)", "Task 1: Did you write an overview? 150+ words? At least 3 trend or comparison words? Task 2: Does each body paragraph have a reason + example? 250+ words? Did you use linking words?"),
          ]
        },
        afternoon: { title: "Listening Mock + Speaking Practice",
          subtasks: [
            T("Do FULL Listening test — Mock 4 (45 min)", "Your fourth mock test this month. No pausing. Score it and write in your notebook."),
            T("Practise Speaking Part 2 — write 3 cue card templates (30 min)", "Topics: describe a person who inspired you, describe a memorable journey, describe something you are good at. For each: write starter phrase + 4 describing points + why it matters. Practise on JumpInto — aim for 1.5 minutes without stopping."),
            T("Practise Speaking Part 3 on JumpInto — 6 abstract questions (25 min)", "Use this template for each answer: 'I think [position]. The reason for this is [reason]. For example, [example]. So overall, I believe [conclusion].' Practise until it sounds natural, not mechanical."),
          ]
        }
      }
    ]
  },
  { week: 3, label: "Month 1 · Week 3",
    days: [
      { day: 1,
        morning: { title: "Writing Task 2 — Advanced Essay Types",
          subtasks: [
            T("Write a Problem-Solution essay — 40 minutes (40 min)", "Topic: 'Traffic congestion is a serious problem in many cities. What are the main causes? What can be done to solve this?' Template reminder: Para 1 = Introduction. Para 2 = 2-3 causes with examples. Para 3 = 2-3 solutions with examples. Para 4 = Conclusion."),
            T("Write an Advantages-Disadvantages essay — 40 minutes (40 min)", "Topic: 'Some people think social media has more benefits than drawbacks. To what extent do you agree?' Template reminder: Para 2 = 2 main advantages + examples. Para 3 = 2 main disadvantages + examples. Para 4 = your overall conclusion."),
            T("Compare your two essays — which one was better? Why? (15 min)", "Write your honest assessment in your notebook. Which template felt more natural? Which essay was clearer?"),
          ]
        },
        afternoon: { title: "Listening All 4 Sections + Vocabulary",
          subtasks: [
            T("Do all 4 Listening sections — full test, no scoring during (45 min)", "Concentration training. Do not pause between sections. Focus entirely on following the audio and writing answers. This builds the stamina you need for the exam."),
            T("Review Section 3 and 4 answers only (20 min)", "Score only Sections 3 and 4. What is your score out of 20? Write it down. Track this number every week — this is where most improvement happens."),
            T("Academic collocations — write 10 in your notebook (20 min)", "These phrases sound natural and academic together: carry out research, draw a conclusion, raise awareness, take into account, draw attention to, have a significant impact on, be aware of, put forward a proposal, reach a decision, make a contribution. Use these in Task 2."),
          ]
        }
      },
      { day: 2,
        morning: { title: "MOCK TEST 5 — Full Listening + Full Reading",
          subtasks: [
            T("Do a FULL Listening test — 45 minutes (45 min)", "Fifth mock. Your Section 3 and 4 scores should be improving compared to Mocks 1-2. Write the result."),
            T("Do a FULL Reading test — 60 minutes (60 min)", "Focus especially on Passage 3 (the hardest). Are you finishing it now? If not: tomorrow spend extra time on Passage 3 strategies."),
            T("Score and track (10 min)", "Date: ___ / L: __ / 40 / R: __ / 40. You should see a clear upward trend by Mock 5."),
          ]
        },
        afternoon: { title: "Mock 5 Review + Speaking Cue Cards",
          subtasks: [
            T("Full error analysis — Listening (20 min)", "Look at all 5 mocks together. Which SECTION has given you the most problems overall? That section needs double the practice in Weeks 4-5."),
            T("Full error analysis — Reading (15 min)", "Which QUESTION TYPE gives you the most trouble? That is your targeted drill for this week."),
            T("Write 8 more cue card templates in your notebook (30 min)", "New topics: a city you would like to visit, a change you would make to your hometown, a time you learned something important, an object that is special to you. For each: starter phrase + 3-4 bullet points + why it matters. Practise on JumpInto."),
          ]
        }
      },
      { day: 3,
        morning: { title: "Writing — Band 7 Quality Markers",
          subtasks: [
            T("Learn what makes a Task 2 Band 7 (30 min)", "Band 7 = your main point is clear AND you support it with specific examples. The difference between Band 6 and 7 is often this: Band 6 says 'for example, technology helps education'. Band 7 says 'for example, interactive apps like Duolingo allow students to practise grammar at their own pace, which improves retention significantly.' Specific, clear, with detail."),
            T("Improve your weakest Task 2 essay from this week (30 min)", "Take the essay you are least happy with. Find one body paragraph. Rewrite it: make the reason clearer, make the example more specific. Then rewrite the conclusion to be stronger."),
            T("Write a Lexical Resource upgrade list in your notebook (20 min)", "Replace these words with better options: good → beneficial / effective / valuable. bad → harmful / negative / detrimental. big → significant / considerable / substantial. many → numerous / a large number of / a high proportion of. show → demonstrate / indicate / suggest / reveal."),
          ]
        },
        afternoon: { title: "Reading Targeted Drills + Vocabulary",
          subtasks: [
            T("3 practices of your weakest question type — timed (45 min)", "Find your weakest question type from your error analysis. Do 3 back-to-back practices. For each: identify why you got each wrong. Is the error type changing? Are you improving?"),
            T("Read one full academic passage for vocabulary (20 min)", "Underline every word you do not know. Look up the meaning. Add the 5 most useful ones to your notebook."),
            T("Write your Week 3 word list — 20 new words (20 min)", "From this week's reading and listening. 20 words with sentences. Read this list tomorrow morning."),
          ]
        }
      },
      { day: 4,
        morning: { title: "MOCK TEST 6 — Full 4-Skill Simulation",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) back to back — no long break (105 min)", "Your first full Listening + Reading simulation in exam conditions. Sit in a quiet room. No phone. Treat it exactly like the real exam."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) immediately after (60 min)", "Full Writing after Listening and Reading. Your brain will be tired — that is the point. Band 7 must be achievable even when not at peak energy."),
            T("Score your work and write in your notebook (15 min)", "L: __ / 40, R: __ / 40. Writing: self-assess with this question: 'Did I follow my templates? Did I write enough words?'"),
          ]
        },
        afternoon: { title: "Mock 6 Full Review",
          subtasks: [
            T("Error analysis: find your 5 most common mistakes across 6 mocks (25 min)", "Go through all 6 mocks. What are the 5 mistakes that appear most often? Write them clearly. These are your Month 2 targets."),
            T("Speaking: do a full Part 1 + Part 2 + Part 3 session on JumpInto (30 min)", "Use your templates. Part 1: 8 questions (2-3 sentences each). Part 2: 2 cue cards (1.5-2 minutes each). Part 3: 5 questions (40-60 seconds each)."),
            T("Plan Month 2 — what are your 2 main goals? (15 min)", "Write in your notebook: 'My goal for Month 2 is to score __ on Listening and __ on Reading by Mock 15.' Be specific and realistic."),
          ]
        }
      },
      { day: 5,
        morning: { title: "Targeted Weakness Day + Mock Test 7",
          subtasks: [
            T("2 hours of focused practice on your weakest area (120 min)", "Use your error analysis from 6 mocks. If Section 4 is weakest: do 4 Section 4 practices. If Task 2 vocabulary is weakest: write 3 essay introductions + 3 body paragraphs with upgraded vocabulary. If Passage 3 is weakest: do 4 timed Passage 3 exercises."),
            T("MOCK TEST 7 — Full Listening test (45 min)", "After your targeted practice session. Your errors should start decreasing on the area you just drilled."),
            T("Score Mock 7 and compare to Mock 1 (10 min)", "From Week 1 to now: how many more points do you get in Listening? Write the difference."),
          ]
        },
        afternoon: { title: "Writing + Speaking Templates Review",
          subtasks: [
            T("Read through ALL your writing templates in your notebook (20 min)", "Task 1: Introduction, Overview, Comparison phrases. Task 2: all 5 introduction templates, body paragraph template, conclusion template. Are they all still there? Are you using them?"),
            T("Write 5 new cue card topics for Speaking Part 2 in your notebook (30 min)", "Topics: a festival in your country, a sports event you watched, a decision that changed your life, a time you were surprised, a skill you would like to have. Write starter + bullet points + reason for each. Practise on JumpInto."),
            T("Update your vocabulary notebook — review all words from Month 1 (20 min)", "Go through every word you wrote this month. Can you still remember all of them? Mark any you have forgotten with a star — review those starred words every day this week."),
          ]
        }
      }
    ]
  },
  { week: 4, label: "Month 1 · Week 4",
    days: [
      { day: 1,
        morning: { title: "Advanced Listening — Distractor Training",
          subtasks: [
            T("Study all 6 distractor types with examples (30 min)", "The 6 main types: (1) Speaker corrects themselves. (2) Speaker uses a synonym of the answer. (3) Speaker mentions the wrong option first. (4) Speaker changes their mind. (5) Speaker gives extra irrelevant detail. (6) Speaker uses a negative to confuse. Write these in your notebook. For each type: write one example."),
            T("Do 2 Section 3 tests — mark every distractor you find (45 min)", "For each distractor you find: write what the speaker said that was misleading, and what the correct answer was. After 2 tests: how many distractors did you successfully avoid?"),
            T("Do 2 Section 4 tests back to back (35 min)", "Two academic lectures in a row. This builds the concentration stamina for exam day when Section 4 comes after 30 minutes of Listening."),
          ]
        },
        afternoon: { title: "Writing Task 2 — Two-Part + Lexical Upgrade",
          subtasks: [
            T("Write a Two-Part Question Essay in 40 minutes (40 min)", "Topic: 'Many young people today find it difficult to afford housing. Why has this problem become so common? What can governments do to help?' Use your template: Para 2 = reasons, Para 3 = solutions. Both must be fully addressed."),
            T("Upgrade the vocabulary in your essay (20 min)", "Go through your essay. Replace every simple word with a more academic one using your upgrade list. Count: how many replacements did you make?"),
            T("Grammar: write 6 'Although' and 6 'Despite' sentences (20 min)", "These make your writing more sophisticated. 'Although technology has many benefits, it also has significant drawbacks.' 'Despite the government's efforts, unemployment remains high.' Write 12 sentences total. Check each one carefully."),
          ]
        }
      },
      { day: 2,
        morning: { title: "MOCK TEST 8 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "Eighth mock. Section 3 and 4 should now be significantly better than Mock 1. Write your scores section by section."),
            T("Full Reading — 60 minutes (60 min)", "Are you finishing all 3 passages comfortably? If Passage 3 is still slow: you need to start with the questions before reading — scan for answers rather than reading everything."),
            T("Score both and track progress (10 min)", "Mock 8: L __ / 40, R __ / 40. Compared to Mock 1: improved by __ in L and __ in R."),
          ]
        },
        afternoon: { title: "Mock 8 Review + Speaking Improvement",
          subtasks: [
            T("Error analysis — compare Mocks 1, 4, and 8 (25 min)", "Three data points: Mock 1 (Week 1), Mock 4 (Week 2), Mock 8 (Week 4). Is the trend upward? If your score has stayed flat, the problem is NOT more practice — it is doing the SAME thing. Change your approach."),
            T("Speaking — pronunciation practice (25 min)", "You do not need a British accent. You need to be EASY TO UNDERSTAND. Practise these sounds that cause confusion: 'th' (think, the), 'v' vs 'w' (very, well), 'r' vs 'l' (right, light). Say each word clearly 5 times. Then use them on JumpInto in full sentences."),
            T("Plan Month 2 in detail (20 min)", "Write: Week 5 goal: ___. Week 6 goal: ___. Week 7 goal: ___. Week 8 goal: ___. Include a score target for Mock 15, 20, and 25."),
          ]
        }
      },
      { day: 3,
        morning: { title: "Writing — Full Timed Practice + Self-Assessment",
          subtasks: [
            T("Task 1 (20 min) + Task 2 (40 min) — full timed session (60 min)", "Use Cambridge IELTS Book 14 or 15. Set your timers. No looking at templates during this practice — you should know them by now. After finishing: read your work aloud. Does it flow? Is the meaning clear?"),
            T("Self-assess Task 1 with 3 questions (10 min)", "1. Is there a clear overview? (If not: this is your most urgent Task 1 fix.) 2. Is it 150+ words? 3. Did you use at least 4 different trend/comparison words?"),
            T("Self-assess Task 2 with 3 questions (10 min)", "1. Is your opinion clear in the first paragraph? 2. Does every body paragraph have a clear reason + a specific example? 3. Is it 250+ words? Count carefully — students often think they have 250 but actually have 230."),
          ]
        },
        afternoon: { title: "Reading — Advanced Passage 3 Practice",
          subtasks: [
            T("Do 3 Passage 3 exercises back to back — 20 minutes each (60 min)", "Passage 3 is always the hardest. Strategy: read the QUESTIONS FIRST. Underline keywords. Then scan the passage to find where each answer is. Do NOT read the whole passage first — you will run out of time."),
            T("Count your Passage 3 accuracy (10 min)", "How many did you get right out of 40 (3 tests × ~13-14 questions)? Write this number. This is your Passage 3 baseline. Track it every week."),
            T("Vocabulary — 15 words for advanced reading topics (20 min)", "These appear in Passage 3 texts: unprecedented, controversial, comprehensive, fundamental, sophisticated, conventional, inevitable, subsequent, thereby, whereas, furthermore, nonetheless, predominantly, respectively, simultaneously."),
          ]
        }
      },
      { day: 4,
        morning: { title: "MOCK TEST 9 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "Ninth mock. Write your scores section by section: S1 __ / 10, S2 __ / 10, S3 __ / 10, S4 __ / 10. Which section is still lowest?"),
            T("Full Reading — 60 minutes (60 min)", "Write your scores passage by passage: P1 __ , P2 __ , P3 __ . Which passage is still hardest?"),
            T("Score both and track (10 min)", "Mock 9: L __ / 40, R __ / 40."),
          ]
        },
        afternoon: { title: "Month 1 Final Review + Preparation for Month 2",
          subtasks: [
            T("Review: what have you achieved in Month 1? (20 min)", "Go through your notebook from Week 1 to Week 4. How many new words do you know? How much have your mock scores improved? What templates have you written? See your progress clearly."),
            T("Write your 3 biggest improvements from Month 1 (15 min)", "Be specific: 'I went from __ / 40 to __ / 40 in Listening.' 'I now understand Matching Headings strategy.' 'I can write a Task 1 in 20 minutes using my template.' This is real progress."),
            T("Write your 3 main goals for Month 2 (15 min)", "Be specific and measurable: 'Score 32/40 on Listening by Mock 15.' 'Write a Band 7 Task 2 without looking at templates.' 'Complete Passage 3 in 18 minutes with 80% accuracy.'"),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 10 — Full 4-Skill (Month 1 Final)",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) — full simulation (105 min)", "Your final Month 1 full mock. Exam conditions. Sit in a quiet place."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Use your templates confidently. After writing, count words for both tasks."),
            T("Score everything and record as your Month 1 final baseline (15 min)", "Month 1 final scores: L __ / 40, R __ / 40. Writing: Task 1 __ , Task 2 __. These scores are your starting point for Month 2."),
          ]
        },
        afternoon: { title: "Mock 10 Review + Month 2 Preview",
          subtasks: [
            T("Full error analysis on all 4 skills (30 min)", "After 10 mocks: your error patterns are now very clear. Write your top 3 most persistent errors. These are the focus of Month 2."),
            T("Speaking: a full Part 1 + 2 + 3 session on JumpInto (25 min)", "Treat this as a real exam. Do not stop mid-answer. Do not look at your notes. Use your templates from memory."),
            T("Celebrate completing Month 1 — you have done 10 full mock tests", "That is more preparation than most IELTS candidates ever do. You are well on your way."),
          ]
        }
      }
    ]
  },
  // ── MONTH 2 (Weeks 5-8) — retakers jump here ─────────────────────────────
  { week: 5, label: "Month 2 · Week 5",
    days: [
      { day: 1,
        morning: { title: "Month 2 Start — Advanced Listening + Writing Quality",
          subtasks: [
            T("Section 4 intensive — 3 lectures in a row (45 min)", "Month 2 goal for Listening: get Section 4 to 7+ out of 10 consistently. Do 3 Section 4 practices back to back. For each: read all questions before pressing play. After each: identify which question you missed and why."),
            T("Write a Band 7 Task 2 using Simon's advanced technique (40 min)", "Topic: 'In many countries, the gap between rich and poor is increasing. Why is this happening? What can be done to reduce it?' Plan for 5 minutes first. Use Simon's structure. After writing: check for Band 7 markers — (1) specific examples (not vague statements), (2) clear topic sentence in each paragraph, (3) no word repeated more than twice, (4) accurate vocabulary (not rare, just precise). Submit to Engnovate Task 2 Checker for AI feedback."),
            T("Write 15 vocabulary upgrade words in your notebook (15 min)", "These are for Month 2: indispensable, consequently, thereby, predominantly, substantially, ultimately, inevitably, comprehensively, fundamentally, progressively, considerably, remarkably, notably, extensively, significantly."),
          ]
        },
        afternoon: { title: "Reading — Advanced Techniques",
          subtasks: [
            T("Passage 3 focus — questions first strategy (45 min)", "Strategy: never read Passage 3 first. Read the questions. Underline keywords in each question. Then scan the passage to find where those keywords appear. Read ONLY that section. This saves 5-7 minutes per passage."),
            T("Multiple Choice — the elimination method (25 min)", "For each multiple choice question: eliminate answers that are clearly wrong first. Usually 2 can be eliminated quickly. Then focus on distinguishing the remaining 2. Always justify your answer from the text — never from memory."),
            T("Vocabulary review: test yourself on all Month 1 words (20 min)", "Without looking at your notebook: write down as many words as you can remember from Month 1. Then check. Star any you forgot — review those daily this week."),
          ]
        }
      },
      { day: 2,
        morning: { title: "MOCK TEST 11 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "11th mock. Section 4 focus: did your targeted practice yesterday help? Write scores section by section."),
            T("Full Reading — 60 minutes (60 min)", "Passage 3 focus: did the questions-first strategy help? Write scores passage by passage."),
            T("Score and compare to Mock 10 (10 min)", "Mock 11: L __ / 40, R __ / 40. Improvement from Mock 10: __ points."),
          ]
        },
        afternoon: { title: "Writing Task 1 — All 4 Types Timed Sprint",
          subtasks: [
            T("Line graph (20 min) + Bar chart (20 min) — back to back (40 min)", "No breaks between them. Use your templates. After both: check that each has an overview and 150+ words."),
            T("Map (20 min) + Process (20 min) — back to back (40 min)", "For the map: use location and change vocabulary. For the process: use passive voice throughout. After both: check that each has an overview."),
            T("Which of the 4 types is weakest? Double practice on that tomorrow morning (5 min)", "Write in your notebook: 'My weakest Task 1 type is ___. I will practise it twice tomorrow.'"),
          ]
        }
      },
      { day: 3,
        morning: { title: "Speaking — Advanced Templates + JumpInto Practice",
          subtasks: [
            T("Write Simon's advanced Part 3 opinion templates in your notebook (25 min)", "Template 1 — for complex questions: 'This is a complex issue. On one hand, [view A]. On the other hand, [view B]. Personally, I believe [your view] because [reason].' Template 2 — Simon's IEE for abstract questions: 'I think the most important factor is [factor]. The reason I say this is [explanation]. For example, [specific example].' Template 3 — the 'it depends' opener Simon recommends: 'It depends on the context. In some cases, [view A] applies. However, in other situations, [view B] is more relevant. Personally...' Write all 3 in your notebook."),
            T("Write templates for 3 complex Part 3 topics and practise on Jumpinto (30 min)", "Topics: (1) The role of government in education. (2) How technology has changed communication. (3) Whether globalisation benefits everyone equally. For each: write a 4-sentence answer using one of Simon's templates. Practise on Jumpinto.com Speaking Part 3. Check AI feedback. Then: join the Discord and discuss one of these topics with a partner for at least 30 minutes — this is where real speaking improvement happens."),
            T("Practise 15 Part 2 cue cards on Jumpinto — no notes (30 min)", "From memory. Use Simon's keyword structure in your head. Aim for 1.5 minutes minimum per card. The goal: no topic feels scary or unfamiliar. After 15 cue cards on Jumpinto, pick your 3 weakest topics and discuss them live on the Discord. Human feedback is different from AI feedback — both are valuable."),
          ]
        },
        afternoon: { title: "MOCK TEST 12 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "12th mock. Your scores should now be consistently higher than Month 1."),
            T("Full Reading — 60 minutes (60 min)", "Are you finishing all 3 passages in time? Is Passage 3 accuracy improving?"),
            T("Score and track — write Mock 12 results (10 min)", "L __ / 40, R __ / 40. You are now 12 mocks into your preparation."),
          ]
        }
      },
      { day: 4,
        morning: { title: "Writing — Essay Band 7 Deep Dive",
          subtasks: [
            T("Study the difference between Band 6 and Band 7 Task 2 (30 min)", "Band 6 body paragraph: 'Technology is useful in education. Students can use computers to learn.' Band 7 body paragraph: 'Technology has transformed how students learn. For example, platforms such as Khan Academy allow students to study at their own pace, which is particularly beneficial for those who fall behind in traditional classroom settings.' The difference: Band 7 is SPECIFIC and DEVELOPED. Write this comparison in your notebook."),
            T("Rewrite your weakest Task 2 body paragraph to Band 7 level (30 min)", "Take a body paragraph from a previous essay. Make the reason clearer. Make the example more specific — use a real or realistic example. Check the vocabulary upgrade list."),
            T("Grammar: relative clauses for complex sentences (25 min)", "Relative clauses make your writing sound more academic. 'Students who use technology regularly tend to perform better.' 'Technology, which has become an integral part of daily life, is now essential in education.' Write 8 sentences with relative clauses on topics you care about."),
          ]
        },
        afternoon: { title: "MOCK TEST 13 — Full 4-Skill",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) (105 min)", "13th mock. Full exam conditions."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Apply the Band 7 technique from this morning. Use specific examples."),
            T("Score and review briefly (20 min)", "L __ / 40, R __ / 40. Writing: is your Task 2 body paragraph more specific now?"),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 14 — Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "14th mock. You are now well into Month 2. Section 4: are you getting 7-8 right consistently?"),
            T("Full Reading — 60 minutes (60 min)", "Passage 3 target: finish in 19 minutes or less. Anything over 21 minutes = still a speed problem."),
            T("Score, track, and note improvement trend (10 min)", "L __ / 40, R __ / 40. Calculate your average from Mocks 11-14. This is your current level."),
          ]
        },
        afternoon: { title: "Mock 14 Review + Week 6 Planning",
          subtasks: [
            T("Root-cause analysis — 5 most persistent errors (25 min)", "After 14 mocks, some errors have appeared 5+ times. Write them down. These are your Week 6 focus."),
            T("Speaking: a complete mock session on JumpInto (25 min)", "Full Part 1 + 2 + 3. No stopping, no notes. Treat it as the real exam. Focus on sounding confident and natural."),
            T("Plan Week 6 — specific targets (15 min)", "Target for Mock 17: L __ / 40, R __ / 40. What needs to change to hit that target?"),
          ]
        }
      }
    ]
  },
  { week: 6, label: "Month 2 · Week 6",
    days: [
      { day: 1,
        morning: { title: "Targeted Error Elimination Day",
          subtasks: [
            T("3 hours of focused practice on your top persistent error (180 min)", "From your error analysis: what is your most common mistake type? Examples: Section 4 questions 7-10 → do 5 Section 4 practices, focus only on the last 4 questions. Passage 3 Matching Information → do 5 Matching Information sets. Task 2 missing examples → write 5 body paragraphs that each include a strong specific example."),
            T("After 3 hours: measure improvement (20 min)", "Do a short test on the same skill you just practised. Did your error rate decrease? Write the result."),
          ]
        },
        afternoon: { title: "MOCK TEST 15 — Full 4-Skill",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) (105 min)", "15th mock. Full exam conditions. This is the halfway point of Month 2's mocks."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Best effort. Apply all techniques."),
            T("Score everything — compare to Mock 10 (20 min)", "Mock 15 vs Mock 10: how much have you improved in Month 2? Write the comparison."),
          ]
        }
      },
      { day: 2,
        morning: { title: "Writing — Coherence and Flow",
          subtasks: [
            T("Learn what Coherence and Cohesion means in IELTS (25 min)", "COHERENCE = your ideas are in a logical order and easy to follow. COHESION = your sentences are connected using linking words. A Band 7 essay has clear paragraphs, each with one main idea, and uses a variety of linking words — not just 'however' and 'furthermore' every time."),
            T("Write a list of better linking words in your notebook (20 min)", "Instead of 'however' → try: 'nevertheless, on the other hand, that said, in contrast'. Instead of 'furthermore' → try: 'in addition, what is more, beyond this, moreover'. Instead of 'so' → try: 'consequently, therefore, as a result, for this reason'. Write these in your notebook."),
            T("Write Task 2 using ONLY your 'better' linking words — no 'however' or 'furthermore' (40 min)", "Topic: 'Should animals be kept in zoos? Discuss the advantages and disadvantages.' Force yourself to use new linking words. It will feel uncomfortable at first — that is how learning works."),
          ]
        },
        afternoon: { title: "MOCK TEST 16 + 17 — Listening Both Days",
          subtasks: [
            T("MOCK TEST 16 — Full Listening — 45 minutes (45 min)", "16th mock."),
            T("MOCK TEST 17 — Full Reading — 60 minutes (60 min)", "17th mock (Reading). Are your scores consistent, or do they vary a lot? Consistency is as important as a high average."),
            T("Score both and write in notebook (10 min)", "Mock 16 L __ / 40, Mock 17 R __ / 40."),
          ]
        }
      },
      { day: 3,
        morning: { title: "Speaking — Extended Fluency Training",
          subtasks: [
            T("25 cue card topics on Jumpinto — rapid practice (40 min)", "Go to Jumpinto.com Speaking Part 2. Do 25 different topics. Each one: 1 minute minimum. The goal: no topic feels difficult. You can speak on anything for 1-2 minutes using Simon's structure. After Jumpinto practice: spend the last 20 minutes on Discord speaking with a partner — practice fluency with a real human is irreplaceable for Part 2."),
            T("10 Part 3 abstract questions on Jumpinto and Discord (30 min)", "Do 5 Part 3 questions on Jumpinto.com for AI feedback (check that your answers are developed enough). Then join the Discord and discuss 2-3 more abstract topics with a speaking partner for at least 20 minutes. Aim for 45-60 seconds per answer. Real discussion is where Part 3 fluency is built — Simon emphasises this."),
            T("Write 5 vocabulary phrases for each common Part 3 topic in your notebook (20 min)", "Environment: 'climate change is a pressing issue, sustainable development, carbon emissions'. Education: 'access to quality education, academic achievement, lifelong learning'. Technology: 'digital transformation, artificial intelligence, online connectivity'. Write these in your notebook."),
          ]
        },
        afternoon: { title: "MOCK TEST 18 — Full 4-Skill",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) (105 min)", "18th mock."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Your writing should now be noticeably better than Mock 6 (your first full Writing mock). Compare them."),
            T("Score and compare to first full mock (Mock 6) (15 min)", "Write: improvement from Mock 6 to Mock 18. This is your Month 2 progress."),
          ]
        }
      },
      { day: 4,
        morning: { title: "MOCK TEST 19 + 20 — Full Listening + Reading",
          subtasks: [
            T("MOCK TEST 19 — Full Listening — 45 minutes (45 min)", "19th mock. Target: 30+ for Band 7 Listening."),
            T("MOCK TEST 20 — Full Reading — 60 minutes (60 min)", "20th mock. Target: 30+ for Band 7 Reading."),
            T("Score both. You have now done 20 full practice tests (10 min)", "Mock 19 L __ / 40, Mock 20 R __ / 40. 20 tests is an extraordinary amount of preparation. Most candidates do 3-5."),
          ]
        },
        afternoon: { title: "Writing + Grammar Polish",
          subtasks: [
            T("Rewrite the weakest paragraph from your last Task 2 (25 min)", "Take the paragraph you are least happy with. Rewrite it: stronger reason, more specific example, better vocabulary. Compare before and after."),
            T("Grammar: complex sentences with 'which' and 'who' (25 min)", "Adding information: 'Technology, which has transformed the way we communicate, is now essential in daily life.' Identifying people: 'Students who study regularly tend to perform better in exams.' Write 10 sentences using 'which' or 'who'. Check that commas are in the right place."),
            T("Review your error log — have any of your persistent mistakes disappeared? (15 min)", "If a mistake has not appeared in the last 5 mocks — it is gone. Remove it from your active focus list. Focus only on the remaining ones."),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 21 — Full 4-Skill",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) (105 min)", "21st mock."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Apply everything from this week."),
            T("Score and update your progress chart (15 min)", "Mock 21: L __ / 40, R __ / 40. Are you on track for your Month 2 target?"),
          ]
        },
        afternoon: { title: "Week 7 Planning + Vocabulary Consolidation",
          subtasks: [
            T("Review all vocabulary from Months 1 and 2 (25 min)", "Go through your entire notebook vocabulary section. Test yourself on every word. Mark any you still forget."),
            T("Write your exam-day plan in your notebook (20 min)", "Write out: (1) What I do in the first 30 seconds of Listening. (2) How I manage time in Reading. (3) What I write first in Task 1. (4) What I write first in Task 2. This plan removes uncertainty on exam day."),
            T("Plan Weeks 7-8 with specific score targets (15 min)", "Target for Mock 25: L __ / 40, R __ / 40. Specific strategies to achieve these."),
          ]
        }
      }
    ]
  },
  { week: 7, label: "Month 2 · Week 7",
    days: [
      { day: 1,
        morning: { title: "Advanced Listening + Reading Deep Drill",
          subtasks: [
            T("Section 4: 4 practices with accuracy tracking (60 min)", "Do 4 Section 4 practices. Record: score out of 10 for each. Is the score improving across the 4 practices? If it stops improving after practice 2, you need to change your strategy — not just do more practice."),
            T("Passage 3: 3 timed practices (55 min)", "20 minutes each. Read questions first. Scan for answers. Time yourself. Record your accuracy. Target: 80% correct on Passage 3 consistently."),
          ]
        },
        afternoon: { title: "MOCK TEST 22 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "22nd mock."),
            T("Full Reading — 60 minutes (60 min)", "22nd Reading mock."),
            T("Score and track (10 min)", "L __ / 40, R __ / 40."),
          ]
        }
      },
      { day: 2,
        morning: { title: "Writing — Final Quality Push",
          subtasks: [
            T("Write your BEST Task 2 essay ever — 40 minutes (40 min)", "Choose a topic you feel confident about. Use all your best techniques: strong introduction, specific examples, varied vocabulary, complex sentences, clear conclusion. Aim to make this your personal best."),
            T("Compare your best essay to your Week 1 essay (20 min)", "Put them side by side. Simon says this comparison is one of the most motivating things you can do. Write 3 specific improvements: for example, 'My examples are now specific and realistic', 'My introduction gives my opinion clearly', 'I use varied vocabulary instead of repeating the same words.' Submit both to Engnovate Task 2 Checker and compare the AI scores."),
            T("Write a 'signature vocabulary' list in your notebook (20 min)", "These are YOUR 30 favourite academic words and phrases — the ones you feel most confident using in essays. This is your exam-day word bank."),
          ]
        },
        afternoon: { title: "MOCK TEST 23 — Full 4-Skill",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) (105 min)", "23rd mock. Full exam conditions."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Best performance possible. Use your signature vocabulary list."),
            T("Score everything (15 min)", "L __ / 40, R __ / 40. Writing: how does it compare to last week's full mock?"),
          ]
        }
      },
      { day: 3,
        morning: { title: "Speaking Final Polish",
          subtasks: [
            T("Write 10 more Part 2 cue card templates in your notebook (30 min)", "New topics: a book that influenced you, a time you helped a stranger, a dream you have for the future, a traditional food from your country, a website you use often. Write starter + bullet points + reason. Practise on JumpInto."),
            T("Part 3 fluency training — 20 questions on JumpInto, no stopping (40 min)", "Do not stop to look at notes. Do not pause for more than 3 seconds. If you lose your train of thought, use: 'What I mean is...' or 'Let me put that another way...'. Keep going."),
            T("Pronunciation focus: practise the 5 words you find hardest (20 min)", "Write your 5 most difficult words to pronounce. Say each one clearly 10 times. Record yourself and listen back. Are you easy to understand?"),
          ]
        },
        afternoon: { title: "MOCK TEST 24 — Full Listening + Reading",
          subtasks: [
            T("Full Listening — 45 minutes (45 min)", "24th mock."),
            T("Full Reading — 60 minutes (60 min)", "24th Reading mock."),
            T("Score: L __ / 40, R __ / 40 (10 min)", "Only one full mock remaining."),
          ]
        }
      },
      { day: 4,
        morning: { title: "Final Weakness Sprint",
          subtasks: [
            T("2 hours on your single biggest remaining problem (120 min)", "After 24 mocks, you know exactly what this is. Give it 2 hours of complete focus. If it is grammar: write 30 complex sentences. If it is Task 2 examples: write 8 body paragraphs with strong specific examples."),
            T("Write a 'never again' rule for each of your remaining errors (20 min)", "Example: 'I will NEVER choose False when the text does not mention the topic. Before writing False, I will ask: does the text say the opposite? If the answer is no — it is Not Given.' Write these rules in your notebook."),
          ]
        },
        afternoon: { title: "Light Review + Exam Preparation",
          subtasks: [
            T("Read through all templates in your notebook (20 min)", "Task 1, Task 2, Speaking Part 1, 2, 3. One final review. These tools are yours — you know them well."),
            T("Write your complete exam-day strategy (25 min)", "Include: (1) Listening — how you will manage the 30-second reading time. (2) Reading — how you will handle Passage 3. (3) Writing — the exact structure you will follow for Task 1 and Task 2. (4) Speaking — what you will do if you do not understand a question."),
            T("Vocabulary: read your signature vocabulary list twice (15 min)", "These 30 words are your most trusted exam-day vocabulary. Read them. Trust them."),
          ]
        }
      },
      { day: 5,
        morning: { title: "MOCK TEST 25 — Final Full Simulation",
          subtasks: [
            T("Listening (45 min) + Reading (60 min) — full exam conditions (105 min)", "Your 25th and final mock test. Treat it like the real exam in every way."),
            T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Your best possible performance. Apply everything you have learned over 2 months."),
            T("Score all skills and write your final pre-exam scores (15 min)", "Mock 25: L __ / 40, R __ / 40. Writing: self-assess. This is your most reliable predictor of exam day performance."),
          ]
        },
        afternoon: { title: "Mock 25 Review + Final Preparation",
          subtasks: [
            T("Review Mock 25 thoroughly — final error analysis (25 min)", "What are the remaining 2-3 errors you still make? These are your exam-day risks. Write them down. Know them. Have a plan for each."),
            T("Speaking: one final complete mock on JumpInto (20 min)", "Full Part 1 + 2 + 3. No notes. Your most confident, natural performance."),
            T("Celebrate completing 2 months and 25 full mock tests (15 min)", "You have done an exceptional amount of preparation. The discipline you have shown over 2 months puts you in a very strong position. Trust your work."),
          ]
        }
      }
    ]
  },
  { week: 8, label: "Month 2 · Week 8",
    days: [
      { day: 1,
        morning: { title: "Light Consolidation — No New Learning",
          subtasks: [
            T("Do Section 1 and 2 only — easy confidence practice (35 min)", "Light, comfortable practice. The goal is to keep your brain active and confident — not to push yourself."),
            T("Read one interesting article in English — no questions (25 min)", "Choose something you genuinely enjoy reading. This maintains your English immersion without exam stress."),
            T("Review your signature vocabulary list and templates (20 min)", "One more read-through of your best vocabulary and your most trusted templates."),
          ]
        },
        afternoon: { title: "Writing Consolidation",
          subtasks: [
            T("Write a Task 2 on a fresh topic — 40 minutes (40 min)", "Choose a topic you have NOT practised. Can you apply your templates to a completely new question? At this point, you should be able to."),
            T("Review your 3 best essays from this month (20 min)", "Read them. Extract your 3 favourite sentences from each — sentences you wrote that you are genuinely proud of. Write these in your notebook."),
            T("Grammar: your 5 most confident complex structures (15 min)", "Write 2 sentences using each one. These are your exam-day signature structures."),
          ]
        }
      },
      { day: 2,
        morning: { title: "Speaking Maintenance",
          subtasks: [
            T("20 cue card topics on Jumpinto then Discord — relaxed and natural (30 min)", "Do 15 topics on Jumpinto.com (relaxed, no pressure). Then spend the last 15 minutes on Discord having a natural conversation — not exam practice, just talking in English. By now, speaking should feel comfortable and enjoyable."),
            T("8 Part 3 questions — split between Jumpinto and Discord (25 min)", "Do 5 on Jumpinto.com for structured AI feedback. Then take 2-3 of the best questions and discuss them with a Discord partner for 15 minutes. Your goal: by exam week, Part 3 should feel like a natural conversation, not an exam performance."),
            T("Final vocabulary review — all words from 2 months (20 min)", "After today: stop trying to learn new words. Trust what you know."),
          ]
        },
        afternoon: { title: "Exam Strategy Final Review",
          subtasks: [
            T("Re-read your exam-day strategy from your notebook (15 min)", "Is it complete? Does it cover all 4 skills? Trust it."),
            T("Read your 'never again' error rules (15 min)", "These rules are now automatic. You know what to watch out for."),
            T("Prepare exam day logistics: ID, test centre location, arrival time (15 min)", "Confirm: what ID do you need? What time should you arrive? (Aim for 30 minutes early.) Do you know the exact address? Remove all logistical uncertainty."),
          ]
        }
      },
      { day: 3,
        morning: { title: "3 Days Before Exam — Very Light",
          subtasks: [
            T("Section 1 only — gentle warm-up (20 min)", "Easy. Comfortable. Just to keep your listening skills active."),
            T("Read one easy article in English (20 min)", "Enjoyable reading. No assessment."),
            T("Review exam-day strategy one final time (15 min)", "Read it. Trust it. Done."),
          ]
        },
        afternoon: { title: "Speaking + Rest",
          subtasks: [
            T("5 cue card topics on JumpInto — conversational and relaxed (25 min)", "No pressure. Just maintain the fluency you have built."),
            T("Read your signature vocabulary list (10 min)", "These are YOUR words. Use them tomorrow."),
            T("Physical health: good sleep, good food, some movement (15 min)", "Your physical state directly affects your performance. Sleep 8 hours. Eat well. Take a short walk. Do not study intensively in the last 3 days."),
          ]
        }
      },
      { day: 4,
        morning: { title: "Exam Eve — Minimal Review Only",
          subtasks: [
            T("Read your templates one last time (15 min)", "One final read. After this: no more studying. Trust what you know."),
            T("Listen to 15 minutes of natural English you enjoy (15 min)", "Keep your ear active. Something fun and interesting."),
            T("Confirm exam logistics: ID ready, direction confirmed, arrival time set (10 min)", "Everything is confirmed. Nothing left to worry about logistically."),
          ]
        },
        afternoon: { title: "Rest + Visualise",
          subtasks: [
            T("Read your signature vocabulary and 3 template starters (10 min)", "Brief, positive, final review."),
            T("Sit quietly and visualise the exam going well (10 min)", "In your mind: walk through each section. You understand the questions. You write clearly. You speak confidently. See it going well."),
            T("Sleep 8 hours — this is the best preparation you can do tonight", "2 months of work will be consolidated by your brain during sleep. Trust your preparation. Sleep."),
          ]
        }
      },
      { day: 5,
        morning: { title: "Exam Day",
          subtasks: [
            T("Light English warm-up — one short article (10 min)", "Activate your English brain."),
            T("Read your Task 1 and Task 2 starter phrases one last time (5 min)", "'The chart shows...' and 'In today's world...' — you know how to start."),
            T("Trust your 2 months of preparation — go and do your best", "25 mock tests. 8 weeks. You are more prepared than most IELTS candidates. Execute your plan with confidence."),
          ]
        },
        afternoon: { title: "Post-Exam Reflection",
          subtasks: [
            T("Write down everything you remember — questions, topics, timing (30 min)", "Do this while it is fresh. Invaluable if you need to retake."),
            T("Evaluate each skill honestly — what went well, what did not (20 min)", "Specific and honest. Not 'Reading was hard' — but 'I ran out of time on Passage 3 because I spent too long on the first question.'"),
            T("Celebrate completing 2 months and 25 mock tests — this is a genuine achievement", "The commitment you showed over 2 months is something to be genuinely proud of."),
          ]
        }
      }
    ]
  }
]

// ─────────────────────────────────────────────────────────────────────────────
// PLAN C — 3-MONTH COMPREHENSIVE (12 weeks, 32 full mocks, 3–4h/day)
// Months: Month 1 = Weeks 1-4, Month 2 = Weeks 5-8, Month 3 = Weeks 9-12
// Retakers: jump to Week 5 (Month 2)
// ─────────────────────────────────────────────────────────────────────────────
export const comprehensivePlan = (() => {
  // Reuse the 2-month plan as Weeks 1-8 (same content, different labels)
  const base = standardPlan.map((w, i) => {
    const monthLabels = [
      "Month 1 · Week 1","Month 1 · Week 2","Month 1 · Week 3","Month 1 · Week 4",
      "Month 2 · Week 5","Month 2 · Week 6","Month 2 · Week 7","Month 2 · Week 8",
    ]
    return { ...w, label: monthLabels[i] || w.label }
  })

  // Weeks 9-12 = Month 3 (advanced mastery + 8 more mocks = 25 + 7 from base already done = 32 total)
  let mockNum = 26

  const month3 = [9,10,11,12].map(wk => {
    const weekLabels = ["Month 3 · Week 9","Month 3 · Week 10","Month 3 · Week 11","Month 3 · Week 12"]
    const m1 = mockNum++; const m2 = mockNum++

    return {
      week: wk,
      label: weekLabels[wk - 9],
      days: [
        { day: 1,
          morning: { title: `Week ${wk} — Advanced Skill Mastery: Listening + Reading`,
            subtasks: [
              T(`Mock Test ${m1} — Full Listening + Reading (105 min)`, `Month 3 mock ${m1}. By now your scores should be approaching Band 7.5. Write: L __ /40, R __ /40.`),
              T("Write down your error types and count how many times each appears (20 min)", "After this many mocks, your mistakes are very specific and predictable. Write them clearly. Focus only on the top 2 remaining errors."),
              T("Advanced collocations and phrases for Band 7.5 Task 2 (20 min)", "Month 3 vocabulary focus. Phrases for Band 7.5: 'a growing body of evidence suggests', 'contrary to popular belief', 'it stands to reason that', 'the implications of this are far-reaching', 'this remains a contentious issue', 'arguably the most significant factor', 'this has sparked considerable debate'. Write each one in your notebook with an example sentence. Add them to your Engnovate flashcard deck."),
            ]
          },
          afternoon: { title: `Week ${wk} — Writing Excellence`,
            subtasks: [
              T(`Mock Test ${m2} — Full Writing (Task 1 + Task 2) (60 min)`, `Month 3 Writing mock ${m2}. Use every technique you have learned. This should be noticeably better than your first writing mock.`),
              T("After writing: check for Band 7.5 markers (15 min)", "Band 7.5 checklist: (1) Specific real-world example in every body paragraph? (2) At least 3 different complex sentence structures? (3) No word repeated more than twice in the essay? (4) Clear position maintained throughout? If yes to all: strong Band 7 essay."),
              T("Speaking: 20 cue cards on Jumpinto + 10 Part 3 + 60 min Discord (30 min)", "Do 20 cue cards on Jumpinto.com (no notes, full fluency). Then 10 Part 3 questions — timed, developed answers. Then: join the Discord and spend at least 60 minutes speaking with a partner. At this stage in Month 3, one hour of real human conversation is as valuable as 2 hours of solo practice. Focus on sounding natural and confident, not just correct."),
            ]
          }
        },
        { day: 2,
          morning: { title: `Week ${wk} — Error Elimination Sprint`,
            subtasks: [
              T("3 hours of focused practice on your single biggest remaining error (180 min)", "Month 3 error elimination. If you still struggle with Section 4: do 6 practices. If Task 2 vocabulary is weak: write 5 essays with upgraded vocabulary. Go deep on ONE specific problem."),
              T("Test yourself on the same skill immediately after (20 min)", "Did the error rate decrease after 3 hours of focused practice? Write: before __ %, after __ %."),
            ]
          },
          afternoon: { title: `Week ${wk} — Vocabulary + Grammar Polish`,
            subtasks: [
              T("Review your complete vocabulary notebook — every single entry (25 min)", "Test yourself on every word. Mark any you forget. Review those starred words every day until the exam."),
              T("Grammar: write 10 complex sentences using your most advanced structures (25 min)", "Use relative clauses, conditionals, passive voice, and cleft sentences in 10 different sentences. Check every one for grammar errors."),
              T("Read your Task 2 templates and signature vocabulary one more time (10 min)", "These are your most important tools. Keep them sharp."),
            ]
          }
        },
        { day: 3,
          morning: { title: `Week ${wk} — Full Exam Simulation`,
            subtasks: [
              T("Listening (45 min) + Reading (60 min) — full exam conditions (105 min)", `Week ${wk} full simulation. Treat it exactly like the real exam.`),
              T("Writing Task 1 (20 min) + Task 2 (40 min) (60 min)", "Your most polished performance. Everything you know."),
              T("Speaking — full Part 1 + 2 + 3 on JumpInto immediately after Writing (25 min)", "Tired brain + full speaking practice = best possible preparation for exam day."),
            ]
          },
          afternoon: { title: `Week ${wk} — Mock Review`,
            subtasks: [
              T("Score and document all results (15 min)", "L __ /40, R __ /40. Writing: self-assess honestly."),
              T("Final error analysis: what are your last 2 remaining errors? (20 min)", "Write them. Write your plan for each. These are your exam-day risk factors — know them."),
              T(`Plan Week ${wk + 1 > 12 ? "final" : wk + 1} — what still needs work? (15 min)`, "Weeks 11-12 are about consolidation and confidence, not new learning. Plan them carefully."),
            ]
          }
        },
        { day: 4,
          morning: { title: `Week ${wk} — Speaking Excellence`,
            subtasks: [
              T("30 cue card topics on Jumpinto + Discord conversation (45 min)", "Rapid practice: 20 topics on Jumpinto.com, timed, no notes. By now every topic should feel natural and comfortable. Then: at least 25 minutes of free conversation on Discord. At Month 3 level, the most important speaking work happens in real conversation, not practice tests. Aim for 1 full hour of Discord speaking today."),
              T("10 Part 3 discussion questions on Jumpinto + Discord (30 min)", "Do 5 on Jumpinto.com — aim for 50-60 seconds per answer, structured with Simon's IEE + implication. Then take 3 of the most interesting questions to Discord and discuss them with a partner for 15-20 minutes. Real discussion builds the depth and naturalness that Part 3 requires."),
              T("Pronunciation — record yourself and compare to Engnovate samples (20 min)", "Record yourself speaking on a Part 2 topic. Listen back: are you easy to understand? Then go to engnovate.com → Pronunciation exercises and identify any remaining sounds that are unclear. Simon's reminder: you need CLARITY, not an accent. Focus on stress (the right syllable) and connected speech (words running together naturally)."),
            ]
          },
          afternoon: { title: `Week ${wk} — Reading + Listening Final Drills`,
            subtasks: [
              T("Passage 3: 4 timed practices — 18 minutes each (72 min)", "Questions first. Scan for answers. Accuracy target: 85%+ correct consistently."),
              T("Section 4: 3 practices with post-analysis (35 min)", "After each practice: find exactly where in the transcript each answer was. How early did the speaker signal it was coming?"),
            ]
          }
        },
        { day: 5,
          morning: { title: `Week ${wk} — Consolidation + Confidence`,
            subtasks: [
              T(wk === 12 ? "FINAL MOCK TEST — Full 4-Skill Simulation" : `Mock Tests ${m1+1} — Full Listening + Reading (105 min)`, wk === 12 ? "Your final complete mock test. 32 total. Full exam conditions. Your absolute best performance." : `Week ${wk} final mock. Full exam conditions.`),
              T("Score and compare to your first mock test from Week 1 (15 min)", "Write both scores side by side. The difference is the result of your preparation. This comparison is motivating and real."),
              T(wk === 12 ? "Celebrate completing 3 months and 32 mock tests" : `Plan Week ${wk + 1} goals`, wk === 12 ? "An extraordinary achievement. 32 mock tests. 12 weeks. You have given yourself every possible advantage." : "Write specific targets for next week."),
            ]
          },
          afternoon: { title: wk === 12 ? "Exam Preparation — Final Week" : `Week ${wk} Review`,
            subtasks: [
              T(wk === 12 ? "Write your complete exam-day plan (25 min)" : "Full error analysis and week review (25 min)", wk === 12 ? "All 4 skills: exactly what you will do, when, and how. Every detail reduces exam-day anxiety." : "Document improvements and remaining targets."),
              T(wk === 12 ? "Read all templates and signature vocabulary one last time (20 min)" : "Vocabulary review and consolidation (20 min)", wk === 12 ? "These tools are yours. You know them well. Trust them." : "Add new words to notebook."),
              T(wk === 12 ? "Rest, sleep well, and trust 3 months of preparation" : `Set Week ${wk + 1} targets (15 min)`, wk === 12 ? "You are ready. Trust your work." : "Specific, measurable, achievable."),
            ]
          }
        }
      ]
    }
  })

  return [...base, ...month3]
})()

// ── Exports ───────────────────────────────────────────────────────────────────
export const PLANS = {
  sprint:        sprintPlan,
  standard:      standardPlan,
  comprehensive: comprehensivePlan,
}

// Legacy alias — other components still work unchanged
export const weeklyPlans = sprintPlan
