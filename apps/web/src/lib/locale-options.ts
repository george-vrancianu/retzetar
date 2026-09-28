type LocaleOption = { value: string; label: string };

const languageNames = new Intl.DisplayNames(["en"], {
  type: "language",
  fallback: "none",
});
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

const additionalLocales = [
  "en-AU",
  "en-CA",
  "en-GB",
  "fr-BE",
  "fr-CA",
  "de-AT",
  "de-CH",
  "it-CH",
  "nl-BE",
  "pt-PT",
  "es-AR",
  "es-MX",
  "sr-BA",
  "zh-HK",
  "zh-TW",
];

function optionFor(value: string): LocaleOption | null {
  const [language, region] = value.split("-");
  const languageName = languageNames.of(language);
  if (!languageName) return null;
  const regionName = region ? regionNames.of(region) : undefined;
  return {
    value,
    label: regionName ? `${languageName} (${regionName})` : languageName,
  };
}

const languageLocales = Array.from({ length: 26 * 26 }, (_, index) => {
  const language = String.fromCharCode(
    97 + Math.floor(index / 26),
    97 + (index % 26),
  );
  if (!languageNames.of(language)) return null;
  const region = new Intl.Locale(language).maximize().region;
  return region && /^[A-Z]{2}$/.test(region)
    ? `${language}-${region}`
    : language;
}).filter((value): value is string => value !== null);

export const localeOptions = [
  ...new Set([...languageLocales, ...additionalLocales]),
]
  .map(optionFor)
  .filter((option): option is LocaleOption => option !== null)
  .sort((left, right) => left.label.localeCompare(right.label));
