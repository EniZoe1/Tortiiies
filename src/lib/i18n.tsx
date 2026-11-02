"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "pl";

const STORAGE_KEY = "tortiiies-lang";

const dictionary = {
  en: {
    nav: {
      home: "Tortiiies — home",
      switchLang: "Switch language to Polish",
      toLight: "Switch to light mode",
      toDark: "Switch to dark mode",
    },
    tabs: {
      label: "Choose a view",
      discover: "Discover",
      order: "Order",
    },
    discover: {
      eyebrow: "01 — Explore",
      title: "Discover Art",
      lead: "Cakes sculpted so true to life that you'll look twice. A few of our latest pieces — each one made by hand, once.",
      galleryLabel: "Selected works",
      story: "Our story",
      storyHint: "A short read, a long obsession.",
      pieces: [
        {
          name: "Golden Retriever",
          trait: "Prestige",
          alt: "Extreme close-up of a sculpted cake that looks exactly like a Golden Retriever's snout",
        },
        {
          name: "German Shepherd",
          trait: "Noble",
          alt: "Extreme close-up of a sculpted cake that looks exactly like a German Shepherd's muzzle",
        },
        {
          name: "Maltese",
          trait: "Grace",
          alt: "Extreme close-up of a sculpted cake that looks exactly like a white Maltese's face",
        },
        {
          name: "Akita",
          trait: "Royal",
          alt: "Extreme close-up of a sculpted cake that looks exactly like an Akita's face",
        },
      ],
    },
    craft: {
      eyebrow: "03 — Craft",
      title: "Our Ingredients &",
      accent: "Craft",
      sponge: {
        label: "Sponge",
        text: "Light, soaked in natural liqueurs and homemade syrups, baked to a traditional recipe.",
      },
      creams: {
        label: "Creams",
        items: [
          "Raspberry with fruit",
          "Rich chocolate (Belgian chocolate)",
          "Velvet cream with mascarpone and Bourbon vanilla",
        ],
      },
      additions: {
        label: "Additions",
        items: [
          "Fresh bananas & wild berries",
          "Crispy feuilletine",
          "Artisanal fruit gummies",
          "Luxurious extras",
        ],
      },
    },
    footer: {
      social: "Social media",
      tagline: "Join our world of sweet art",
      rights: "All rights reserved.",
    },
    order: {
      eyebrow: "02 — Action",
      title: "Order Now",
      lead: "Tell us about your celebration. We reply within 24 hours with a sketch and a quote.",
      steps: ["Share your idea", "Receive a sketch", "Enjoy your cake"],
      name: "Your name",
      email: "Email",
      date: "Event date",
      calPrev: "Previous month",
      calNext: "Next month",
      calClear: "Clear",
      calToday: "Today",
      occasion: "Occasion",
      occasions: ["Wedding", "Birthday", "Corporate", "Other"],
      message: "Tell us about your dream cake",
      messagePlaceholder: "Servings, flavours, colours, inspiration…",
      submit: "Request a quote",
      sent: "Your email app should open with everything filled in. Just press send — we'll be in touch within 24 hours.",
      orWrite: "Or reach us directly",
      leadTime: "Booking 3–4 weeks ahead is recommended.",
    },
    story: {
      title: "The Tortiiies story",
      close: "Close",
      paragraphs: [
        "Tortiiies started in a tiny kitchen with a simple belief: a cake should be remembered long after the last slice is gone.",
        "We treat sugar like clay and gold like light. Every piece is designed on paper, sculpted by hand and finished with edible gold — never mass-produced, never repeated.",
        "Today we create cakes for weddings, galleries and the occasional very lucky Tuesday. If you can imagine it, we'd love to bake it.",
      ],
      signature: "— The Tortiiies atelier",
    },
  },
  pl: {
    nav: {
      home: "Tortiiies — strona główna",
      switchLang: "Zmień język na angielski",
      toLight: "Włącz jasny motyw",
      toDark: "Włącz ciemny motyw",
    },
    tabs: {
      label: "Wybierz widok",
      discover: "Odkryj",
      order: "Zamów",
    },
    discover: {
      eyebrow: "01 — Odkrywaj",
      title: "Odkryj sztukę",
      lead: "Torty rzeźbione tak wiernie, że spojrzysz dwa razy. Kilka naszych najnowszych dzieł — każde wykonane ręcznie, tylko raz.",
      galleryLabel: "Wybrane prace",
      story: "Nasza historia",
      storyHint: "Krótka lektura, długa pasja.",
      pieces: [
        {
          name: "Golden Retriever",
          trait: "Prestiż",
          alt: "Ekstremalne zbliżenie tortu rzeźbionego tak, że wygląda dokładnie jak pysk golden retrievera",
        },
        {
          name: "Owczarek niemiecki",
          trait: "Szlachetność",
          alt: "Ekstremalne zbliżenie tortu rzeźbionego tak, że wygląda dokładnie jak pysk owczarka niemieckiego",
        },
        {
          name: "Maltańczyk",
          trait: "Gracja",
          alt: "Ekstremalne zbliżenie tortu rzeźbionego tak, że wygląda dokładnie jak pysk białego maltańczyka",
        },
        {
          name: "Akita",
          trait: "Królewskość",
          alt: "Ekstremalne zbliżenie tortu rzeźbionego tak, że wygląda dokładnie jak pysk akity",
        },
      ],
    },
    craft: {
      eyebrow: "03 — Rzemiosło",
      title: "Sztuka",
      accent: "Smaku",
      sponge: {
        label: "Biszkopt",
        text: "Lekki, nasączany naturalnymi likierami i domowymi syropami, pieczony według tradycyjnej receptury.",
      },
      creams: {
        label: "Kremy",
        items: [
          "Malinowy z owocami",
          "Bogaty czekoladowy (belgijska czekolada)",
          "Aksamitny krem z mascarpone i wanilią Bourbon",
        ],
      },
      additions: {
        label: "Dodatki",
        items: [
          "Świeże banany i owoce leśne",
          "Chrupiące feuilletine",
          "Rzemieślnicze żelki owocowe",
          "Luksusowe dodatki",
        ],
      },
    },
    footer: {
      social: "Social media",
      tagline: "Wejdź do naszego świata słodkiej sztuki",
      rights: "Wszelkie prawa zastrzeżone.",
    },
    order: {
      eyebrow: "02 — Działaj",
      title: "Zamów teraz",
      lead: "Opowiedz nam o swoim święcie. Odpowiadamy w 24 godziny ze szkicem i wyceną.",
      steps: ["Opisz pomysł", "Otrzymaj szkic", "Ciesz się tortem"],
      name: "Imię i nazwisko",
      email: "E-mail",
      date: "Data wydarzenia",
      calPrev: "Poprzedni miesiąc",
      calNext: "Następny miesiąc",
      calClear: "Wyczyść",
      calToday: "Dziś",
      occasion: "Okazja",
      occasions: ["Wesele", "Urodziny", "Firma", "Inne"],
      message: "Opowiedz o swoim wymarzonym torcie",
      messagePlaceholder: "Liczba porcji, smaki, kolory, inspiracje…",
      submit: "Poproś o wycenę",
      sent: "Aplikacja pocztowa powinna się otworzyć z wypełnioną wiadomością. Wystarczy wysłać — odezwiemy się w ciągu 24 godzin.",
      orWrite: "Lub napisz bezpośrednio",
      leadTime: "Zalecamy rezerwację z 3–4-tygodniowym wyprzedzeniem.",
    },
    story: {
      title: "Historia Tortiiies",
      close: "Zamknij",
      paragraphs: [
        "Tortiiies zaczęło się w maleńkiej kuchni, z prostym przekonaniem: tort powinien być pamiętany długo po zjedzeniu ostatniego kawałka.",
        "Cukier traktujemy jak glinę, a złoto jak światło. Każde dzieło projektujemy na papierze, rzeźbimy ręcznie i wykańczamy jadalnym złotem — nigdy seryjnie, nigdy dwa razy tak samo.",
        "Dziś tworzymy torty na wesela, wernisaże i od czasu do czasu na wyjątkowo szczęśliwy wtorek. Jeśli potrafisz to sobie wyobrazić, chętnie to upieczemy.",
      ],
      signature: "— Pracownia Tortiiies",
    },
  },
} as const;

export type Dictionary = (typeof dictionary)["en"];

type I18nContextValue = {
  lang: Lang;
  t: Dictionary;
  toggleLang: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  // Restore saved choice, otherwise follow the browser language.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "pl") {
      setLang(saved);
    } else if (navigator.language?.toLowerCase().startsWith("pl")) {
      setLang("pl");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "pl" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, t: dictionary[lang] as unknown as Dictionary, toggleLang }),
    [lang, toggleLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
