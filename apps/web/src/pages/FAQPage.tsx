
import { Link } from "react-router-dom";
export function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="font-display text-4xl font-semibold text-ink mb-8">Frequently Asked Questions</h1>
      <div className="space-y-6">
        <div>
          <h3 className="font-display font-semibold text-lg">How do I connect my wallet?</h3>
          <p className="font-body text-ink/70">Use the Freighter extension and switch to Stellar Testnet.</p>
        </div>
        <div>
          <h3 className="font-display font-semibold text-lg">Are there any fees?</h3>
          <p className="font-body text-ink/70">No, claiming scholarships is completely free for students.</p>
        </div>
      </div>
    </div>
  );
}
