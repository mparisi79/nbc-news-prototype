import { XMLParser } from "fast-xml-parser";

const FEEDS = [
  { url: "https://feeds.nbcnews.com/nbcnews/public/news", category: "TOP" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/politics", category: "POLITICS" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/world", category: "WORLD" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/us-news", category: "US" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/health", category: "HEALTH" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/tech", category: "TECH" },
  { url: "https://feeds.nbcnews.com/nbcnews/public/sports", category: "SPORTS" },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function extractImage(item) {
  // Try media:content
  const mc = item["media:content"];
  if (mc) {
    if (Array.isArray(mc)) {
      const img = mc.find(m => m["@_medium"] === "image" || m["@_type"]?.startsWith("image"));
      if (img?.["@_url"]) return img["@_url"];
      if (mc[0]?.["@_url"]) return mc[0]["@_url"];
    } else if (mc["@_url"]) return mc["@_url"];
  }
  // Try media:thumbnail
  const mt = item["media:thumbnail"];
  if (mt) {
    if (Array.isArray(mt)) return mt[0]?.["@_url"] || null;
    return mt["@_url"] || null;
  }
  // Try media:group
  const mg = item["media:group"];
  if (mg) {
    const mgc = mg["media:content"];
    if (Array.isArray(mgc)) {
      const img = mgc.find(m => m["@_medium"] === "image");
      if (img?.["@_url"]) return img["@_url"];
    } else if (mgc?.["@_url"]) return mgc["@_url"];
  }
  // Try enclosure
  const enc = item.enclosure;
  if (enc?.["@_type"]?.startsWith("image")) return enc["@_url"] || null;
  // Try og:image or img in description
  const desc = item.description || item["content:encoded"] || "";
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)/);
  if (imgMatch) return imgMatch[1];
  return null;
}

function parseItems(xml, category) {
  try {
    const parsed = parser.parse(xml);
    const channel = parsed?.rss?.channel;
    if (!channel) return [];
    const items = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    return items.slice(0, 8).map((item, i) => ({
      id: `${category}-${i}`,
      category,
      title: item.title || "",
      description: (item.description || "").replace(/<[^>]*>/g, "").slice(0, 200),
      link: item.link || "",
      pubDate: item.pubDate || "",
      image: extractImage(item),
      author: item["dc:creator"] || item.author || "NBC News",
    }));
  } catch { return []; }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ url, category }) => {
        const res = await fetch(url, {
          next: { revalidate: 300 }, // cache 5 min
          headers: { "User-Agent": "NBC-News-Prototype/1.0" },
        });
        if (!res.ok) return [];
        const xml = await res.text();
        return parseItems(xml, category);
      })
    );
    const articles = results
      .filter(r => r.status === "fulfilled")
      .flatMap(r => r.value)
      .filter(a => a.title);

    return Response.json({ articles, fetchedAt: new Date().toISOString() });
  } catch (e) {
    return Response.json({ articles: [], error: e.message }, { status: 500 });
  }
}
