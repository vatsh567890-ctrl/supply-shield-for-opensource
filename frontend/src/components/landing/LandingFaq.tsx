"use client";

const FAQ_ITEMS = [
  {
    question: "What does Supply Shield check?",
    answer:
      "Added code in pull requests, the files a change touches, how new the author’s account is, and dependency names, ages and known vulnerabilities.",
  },
  {
    question: "How is a PR scored?",
    answer:
      "A trained XGBoost model gives a probability, and hand-written rules add weight for clear red flags. The two are combined into one risk score and a Low, Medium or High verdict.",
  },
  {
    question: "Why SHAP?",
    answer:
      "A score alone is hard to trust. SHAP shows which signals pushed a pull request toward flagged, so reviewers can check the reasoning quickly.",
  },
  {
    question: "Does it replace code review?",
    answer:
      "No. It is a triage signal that tells reviewers where to look first. A human still makes the call.",
  },
  {
    question: "How do I run the full app?",
    answer:
      "Install the requirements, run build_dataset.py and train.py, then start the Streamlit app. The console above is a browser preview of its seven tabs.",
  },
];

export function LandingFaq() {
  return (
    <section className="landing-sec" id="faq">
      <h2 className="landing-rv" style={{ marginBottom: "30px" }}>
        Frequently asked questions
      </h2>
      {FAQ_ITEMS.map((item, idx) => (
        <details key={idx} className="landing-rv">
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

