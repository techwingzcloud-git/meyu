export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-14">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 md:grid-cols-2 lg:grid-cols-[1.15fr_0.9fr_0.9fr_1fr] lg:px-10">
        <div>
          <div className="font-display text-2xl text-foreground">Shop Non-Stop on Meyu Signature</div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Trusted by millions, curated for everyday shopping, seamless checkout, and fast app
            access.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#"
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/80"
            >
              Download on the App Store
            </a>
            <a
              href="#"
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/80"
            >
              Get it on Google Play
            </a>
          </div>
        </div>

        {[
          { t: "Careers", l: ["Become a Supplier", "Hall of Fame", "Sitemap"] },
          { t: "Legal And More", l: ["Legal", "Notices and Returns", "Privacy Policy"] },
        ].map((c) => (
          <div key={c.t} className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary">{c.t}</div>
            <ul className="mt-4 space-y-2">
              {c.l.map((x) => (
                <li key={x}>
                  <a href="#" className="text-sm text-foreground/75 hover:text-primary">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-primary">Reach Out To Us</div>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-foreground/75">
            {["Instagram", "Facebook", "YouTube", "LinkedIn", "Twitter"].map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-full border border-border px-3 py-1.5 hover:text-primary"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-primary">Contact Us</div>
          <div className="mt-4 space-y-2 text-sm text-foreground/75">
            <div>Fashnear Technologies Private Limited</div>
            <div>CIN: U74900KA2015PTC082263</div>
            <div>
              06-105-B, 06-102, (138 Wu) Meyu Signature, No. 78/9, Outer Ring Road, Bellandur,
              kakaveri, Rasipuram-623528, Namakkal, India
            </div>
            <div>E-mail address: mohdsalif.cy@gmail.com</div>
            <div>© 2015-{new Date().getFullYear()} meyusignature.com</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
