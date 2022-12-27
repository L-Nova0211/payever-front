// @deprecated
export function threatMetrixInit(
  domain: string, orgId: string, sessionId: string, params: {}, callback: (success: boolean) => void
) {
  const paramsArray: string[] = [];
  for (const key in params) {
    paramsArray.push(`${key}=${encodeURIComponent(params[key])}`);
  }
  const paramsStr = paramsArray.join('&');

  const existing: HTMLScriptElement = document.getElementById('pe-tmetrix-tagsjs') as HTMLScriptElement;
  if (existing) {
    existing.src = `https://${domain}/fp/tags.js?org_id=${orgId}&session_id=${sessionId}&${paramsStr}`;
    callback(true);
  } else {
    const script: HTMLScriptElement = document.createElement('script');
    script.id = 'pe-tmetrix-tagsjs';
    script.src = `https://${domain}/fp/tags.js?org_id=${orgId}&session_id=${sessionId}&${paramsStr}`;
    script.onload = () => {
      callback(true);
    };
    script.onerror = () => {
      callback(false);
    };
    document.head.appendChild(script);
  }
}
(window as any).pe_threatMetrixInit = threatMetrixInit;
