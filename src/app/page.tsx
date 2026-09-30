import { ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Pill } from "../components/ui/Pill";
import { Section } from "../components/ui/Section";
import { FeaturedProducts, HomeGuestNote } from "../components/HomeIslands";
import { demoFlow, demoTestCard, site } from "../data/site";

const exploreCards = [
  {
    href: "/store",
    title: "One-Time Payments",
    lede: "Browse the catalog, review the cart, and pay with a Stripe test card.",
  },
  {
    href: "/subscription",
    title: "Recurring Payments",
    lede: "Pick a plan, check out, and unlock role-gated demo content.",
  },
  {
    href: "/profile",
    title: "Manage Everything",
    lede: "Receipts, active plans, and the Stripe customer portal in one place.",
  },
];

export default function Home() {
  return (
    <>
      <section className="w-full bg-zinc-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center md:px-6 md:py-28">
          <Pill>
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400"
              aria-hidden="true"
            />
            Demo store · Test mode
          </Pill>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-bold tracking-tight text-zinc-50 md:text-5xl">
            A full-stack storefront: auth, cart, Stripe, subscriptions
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-zinc-400">
            {site.description} Built with Next.js, Firebase, and Stripe — pay with{" "}
            <span className="font-mono text-sm text-zinc-300">{demoTestCard.number}</span>, never a
            real card.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/store" size="lg">
              Browse products
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button href="/subscription" variant="secondary" size="lg">
              See subscriptions
            </Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <HomeGuestNote />
            <a
              href={site.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline"
            >
              View source on GitHub
            </a>
          </div>
        </div>
      </section>

      <Section
        eyebrow="How the demo works"
        title="From guest to paying customer in four steps"
        tone="raised"
      >
        <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {demoFlow.map((item) => (
            <li key={item.step}>
              <Card>
                <p className="font-mono text-sm font-bold text-brand-400">{item.step}</p>
                <p className="mt-2 font-bold text-zinc-100">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400">{item.lede}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow="Featured"
        title="Try the bestsellers"
        lede="A taste of the catalog — the full store adds search, sorting, and product pages."
      >
        <FeaturedProducts />
      </Section>

      <Section eyebrow="Next steps" title="Explore the demo" tone="raised">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {exploreCards.map((card) => (
            <a key={card.href} href={card.href} className="block h-full">
              <Card>
                <p className="font-bold text-xl text-zinc-100">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{card.lede}</p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300">
                  Explore
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </p>
              </Card>
            </a>
          ))}
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-center font-mono text-xs text-zinc-400">
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Test mode — no real charges anywhere on this site.
        </p>
      </Section>
    </>
  );
}
