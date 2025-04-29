export function searchParams(url: string) {
  // Normalize the input URL
  let normalizedUrl = url;

  // Check if it's a partial URL (just path)
  if (!url.includes("://") && !url.startsWith("//")) {
    // Make sure the path starts with "/"
    normalizedUrl = url.startsWith("/") ? url : "/" + url;
  }

  // Use URL constructor for parsing if it's a full URL
  let parsedUrl;
  try {
    // For complete URLs, use directly
    if (url.includes("://") || url.startsWith("//")) {
      parsedUrl = new URL(url);
    } else {
      // For path-only URLs, use a dummy base
      parsedUrl = new URL(normalizedUrl, "http://example.com");
    }
  } catch (error) {
    // Return empty result for invalid URLs
    return { path: "", data: {} };
  }

  // Extract the path
  const path = parsedUrl.pathname;

  // Extract search parameters
  const data = {};
  parsedUrl.searchParams.forEach((value, key) => {
    //@ts-ignore
    data[key] = value;
  });

  return {
    path: path,
    data: data,
  };
}

export function queryData(query: string) {
  const data = {};

  const params = new URLSearchParams(query);

  params.forEach((value, key) => {
    //@ts-ignore
    data[key] = value;
  });

  return data;
}
