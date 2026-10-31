import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-7xl text-clay">404</p>
      <h1 className="mt-4 font-display text-3xl text-foreground">This path isn't on the map.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Even an honest store has a few empty shelves. The rest of the forest is intact.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          className="focus-ring inline-flex h-12 items-center justify-center gap-2 border border-foreground px-6 text-sm font-semibold hover:bg-foreground hover:text-background"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </a>
        <Link
          to="/shop"
          className="focus-ring inline-flex h-12 items-center justify-center bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-forest-deep"
        >
          To the store
        </Link>
      </div>
    </div>
  );
}
