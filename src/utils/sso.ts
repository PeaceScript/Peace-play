import { User } from "firebase/auth";

interface BuildSsoUrlOptions {
  baseUrl: string;
  idToken?: string;
  sourceApp: string;
  returnUrl?: string;
}

const normalizeUrl = (url: string) => {
  if (!url) return "";
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const buildSsoUrl = ({ baseUrl, idToken, sourceApp, returnUrl }: BuildSsoUrlOptions) => {
  const normalizedBaseUrl = normalizeUrl(baseUrl);
  if (!normalizedBaseUrl) {
    return "";
  }

  let url: URL;
  try {
    url = new URL(normalizedBaseUrl);
  } catch {
    return normalizedBaseUrl;
  }

  url.searchParams.set("from", sourceApp);
  if (idToken) {
    url.searchParams.set("idToken", idToken);
  }
  if (returnUrl) {
    url.searchParams.set("returnUrl", returnUrl);
  }

  return url.toString();
};

export const openExternalWithSso = async ({
  user,
  targetUrl,
  sourceApp,
  fallbackReturnUrl,
}: {
  user: User | null;
  targetUrl: string;
  sourceApp: string;
  fallbackReturnUrl?: string;
}) => {
  if (!targetUrl) {
    return;
  }

  const returnUrl = typeof window !== "undefined" ? window.location.href : fallbackReturnUrl;

  if (!user) {
    const publicUrl = buildSsoUrl({
      baseUrl: targetUrl,
      sourceApp,
      returnUrl,
    });
    window.open(publicUrl || targetUrl, "_blank", "noopener,noreferrer");
    return;
  }

  try {
    const idToken = await user.getIdToken();
    const ssoUrl = buildSsoUrl({
      baseUrl: targetUrl,
      idToken,
      sourceApp,
      returnUrl,
    });
    window.open(ssoUrl || targetUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    console.error("Failed to build SSO URL", error);
    const publicUrl = buildSsoUrl({
      baseUrl: targetUrl,
      sourceApp,
      returnUrl,
    });
    window.open(publicUrl || targetUrl, "_blank", "noopener,noreferrer");
  }
};
