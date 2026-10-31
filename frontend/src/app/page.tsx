/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import "./landing.css";
import { LandingShield3D } from "@/components/landing/LandingShield3D";
import { LandingConsole } from "@/components/landing/LandingConsole";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingClientEffects } from "@/components/landing/LandingClientEffects";

export const metadata = {
  title: "SupplyShield | Securing every merge",
  description:
    "Malicious pull request and dependency-update detection for open source, with every verdict explained by SHAP.",
};

export default function LandingPage() {
  return (
    <div className="landing-root">
      <LandingShield3D />
      <LandingClientEffects />

      {/* Navigation */}
      <nav className="landing-nav">
        <a className="landing-logo" href="#home">
          SUPPLY
        </a>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#core">Core</a>
          </li>
          <li>
            <a href="#app">Console</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
        </ul>
        <div className="landing-nav-actions">
          <Link className="landing-btn" href="/login">
            Sign in
          </Link>
          <a className="landing-btn landing-btn-fill" href="#app">
            Launch console
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="landing-hero" id="home">
        <img
          src="/landing/hero-graphic.webp"
          alt=""
          className="landing-hero-img"
        />
        <p className="landing-kick">Pre-merge defense</p>
        <h1>Supply Shield</h1>
        <h3>Securing every merge</h3>
        <p>
          Malicious pull request and dependency-update detection for open source,
          with every verdict explained by SHAP. Supply Shield never executes the
          code it checks.
        </p>
        <div className="landing-row">
          <a className="landing-btn landing-btn-fill" href="#app">
            Open the console
          </a>
          <Link className="landing-btn" href="/login">
            Sign in with GitHub
          </Link>
          <Link className="landing-btn" href="/scan?demo=1">
            Try a demo scan
          </Link>
          <a className="landing-btn" href="#about">
            How it works
          </a>
        </div>
        <span className="landing-hint">Scroll to rotate</span>
      </header>

      {/* Marquee Strip */}
      <div className="landing-mq" aria-hidden="true">
        <div>
          <span>GitHub PRs</span>
          <span>PyPI</span>
          <span>OSV</span>
          <span>SHAP</span>
          <span>XGBoost</span>
          <span>npm soon</span>
          <span>GitHub PRs</span>
          <span>PyPI</span>
          <span>OSV</span>
          <span>SHAP</span>
          <span>XGBoost</span>
          <span>npm soon</span>
        </div>
      </div>

      {/* Core Section */}
      <section className="landing-sec landing-core" id="core">
        <div className="landing-grid">
          <div></div>
          <div className="landing-card landing-rv">
            <p className="landing-lbl" style={{ marginTop: 0 }}>
              Pre-merge defense
            </p>
            <h2>Supply Shield core</h2>
            <div className="landing-stats">
              <div>
                <b>16</b>
                <small>Diff signals</small>
              </div>
              <div>
                <b>7</b>
                <small>Console tabs</small>
              </div>
              <div>
                <b>1</b>
                <small>Verdict per PR</small>
              </div>
            </div>
            <p>
              <b>Signals:</b> obfuscation, install hooks, typosquats, CI changes,
              author trust.
            </p>
            <p>
              Supply Shield blends an XGBoost model with hand-written rules, so
              obvious red flags are caught even when the model is unsure, and
              SHAP shows which signals drove each score.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="landing-sec" id="how-it-works">
        <span id="about" style={{ position: "absolute", top: 0 }} />
        <div className="landing-grid">
          <div className="landing-card landing-rv">
            <p className="landing-lbl">About Supply Shield</p>
            <h2>Welcome to Supply Shield, where every merge is examined</h2>
            <p>
              Open source runs on trust, and attackers know it. Supply Shield
              reads every pull request and dependency update, scores the risk,
              and shows exactly why. Fewer blind merges, clearer reviews, and a
              safer supply chain.
            </p>
            <p className="landing-note">
              Supply Shield never executes the code it checks. Free for public
              open-source projects.
            </p>
          </div>
          <div className="landing-pic landing-rv">
            <img
              src="/landing/about-hand.webp"
              alt="A human hand reaching toward a wireframe hand on a monitor"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Middle Animated Marquee Band */}
      <div className="landing-band">
        <img src="/landing/band-background.webp" alt="" />
        <div className="landing-mq">
          <div>
            <span>Scan it, flag it</span>
            <span>Scan it, flag it</span>
            <span>Scan it, flag it</span>
            <span>Scan it, flag it</span>
          </div>
        </div>
      </div>

      {/* Console Section */}
      <section className="landing-sec" id="app">
        <p className="landing-lbl landing-rv">The console</p>
        <h2 className="landing-rv">The Supply Shield console</h2>
        <img
          className="landing-strip landing-rv"
          src="/landing/console-strip.webp"
          alt="A glowing hologram figure surrounded by document, chat, chart and check icons"
          loading="lazy"
        />
        <LandingConsole />
      </section>

      {/* FAQ Section */}
      <LandingFaq />

      {/* Giant Footer */}
      <footer className="landing-footer">
        <div className="big" aria-hidden="true">
          SUPPLY
        </div>
        <p>© Supply Shield. Built for open source.</p>
      </footer>
    </div>
  );
}
