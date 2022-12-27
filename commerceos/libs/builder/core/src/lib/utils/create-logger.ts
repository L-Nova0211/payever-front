export function pebCreateLogger(namespace: string): (...a: unknown[]) => void | undefined {
  const ENABLED_LOGS = ['editor:actions', 'sandbox:prepare'];

  const acceptableNss = [
    ...namespace
      .split(':')
      .map((el, i, all) =>
        [...all.slice(0, i), '*'].join(':'),
      ),
    namespace,
  ];

  // TODO: Fix
  // if (globalThis.PEB_LOGS
  //   && globalThis.PEB_LOGS.split(',').find(
  //     eNs => acceptableNss.includes(eNs),
  //   )
  // ) {
  if (ENABLED_LOGS.find(eNs => acceptableNss.includes(eNs))) {
    const background = Math.abs(getHash(namespace)).toString(16)
      .padStart(6, '0')
      .slice(0, 6)
      .split('')
      .map(c => Number(Math.floor(parseInt(c, 16) / 1.25)).toString(16))
      .join('');

    return console.log.bind(
      console,
      `%c ${namespace} `, `background: #${background}; color: white; line-height: 2;`,
    );
  }

  return () => undefined;
}

function getHash(str) {
  let hash = 0;

  for (let i = 0; i < str.length; i = i + 1) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }

  return hash;
}
