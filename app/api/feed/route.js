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

function getUrl(obj) {
  if (!obj) return null;
  if (typeof obj === "string" && obj.startsWith("http")) return obj;
  if (obj["@_url"]) return obj["@_url"];
  if (obj["@_href"]) return obj["@_href"];
  return null;
}

function extractImage(item) {
  // 1. Direct image field
  if (item.image) {
    if (typeof item.image === "string" && item.image.startsWith("http")) return item.image;
    if (item.image?.url) return item.image.url;
  }

  // 2. media:content (single or array)
  const mc = item["media:content"];
  if (mc) {
    if (Array.isArray(mc)) {
      const img = mc.find(m => m["@_medium"] === "image" || m["@_type"]?.startsWith("image"));
      if (img?.["@_url"]) return img["@_url"];
      // Fall back to first item with a URL
      for (const m of mc) { const u = getUrl(m); if (u) return u; }
    } else {
      const u = getUrl(mc);
      if (u) return u;
    }
  }

  // 3. media:thumbnail (single or array)
  const mt = item["media:thumbnail"];
  if (mt) {
    if (Array.isArray(mt)) {
      for (const t of mt) { const u = getUrl(t); if (u) return u; }
    } else {
      const u = getUrl(mt);
      if (u) return u;
    }
  }

  // 4. media:group — check both media:content AND media:thumbnail inside
  const mg = item["media:group"];
  if (mg) {
    const mgc = mg["media:content"];
    if (mgc) {
      if (Array.isArray(mgc)) {
        const img = mgc.find(m => m["@_medium"] === "image");
        if (img?.["@_url"]) return img["@_url"];
        for (const m of mgc) { const u = getUrl(m); if (u) return u; }
      } else {
        const u = getUrl(mgc);
        if (u) return u;
      }
    }
    const mgt = mg["media:thumbnail"];
    if (mgt) {
      const u = getUrl(Array.isArray(mgt) ? mgt[0] : mgt);
      if (u) return u;
    }
  }

  // 5. enclosure
  const enc = item.enclosure;
  if (enc) {
    if (Array.isArray(enc)) {
      const img = enc.find(e => e["@_type"]?.startsWith("image"));
      if (img?.["@_url"]) return img["@_url"];
    } else if (enc["@_type"]?.startsWith("image") || enc["@_url"]?.match(/\.(jpg|jpeg|png|webp)/i)) {
      return enc["@_url"] || null;
    }
  }

  // 6. Search description and content:encoded for <img> tags
  //    Decode HTML entities first so &lt;img&gt; patterns are caught
  const raw = [item.description, item["content:encoded"]].filter(Boolean).join(" ");
  const decoded = raw
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'");
  const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)/);
  if (imgMatch?.[1]) return imgMatch[1];

  // 7. Look for any bare image URL in the raw content
  const urlMatch = decoded.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)[^\s"'<>]*)/i);
  if (urlMatch?.[1]) return urlMatch[1];

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
      author: (() => {
        const raw = item["dc:creator"] || item.author || "NBC News";
        if (Array.isArray(raw)) return raw.join(", ");
        return raw;
      })(),
    }));
  } catch { return []; }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async ({ url, category }) => {
        const res = await fetch(url, {
          next: { revalidate: 300 },
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
