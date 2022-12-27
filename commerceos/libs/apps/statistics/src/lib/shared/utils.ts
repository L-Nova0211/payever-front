/**
 * Returns widget data with the right data model
 *
 * @param dataRaw widget data
 */
export function mapWidgetData(dataRaw) {
  const powers = [
    { key: 'Q', value: Math.pow(10, 15) },
    { key: 'T', value: Math.pow(10, 12) },
    { key: 'B', value: Math.pow(10, 9) },
    { key: 'M', value: Math.pow(10, 6) },
    { key: 'K', value: 1000 },
  ];

  return dataRaw.map((settings, index) => {
    const newSettings = settings.map((setting) => {
      if (typeof setting === 'string') {
        if (setting.includes('%')) {
          return {
            value: Math.round(Number(setting.replace('%', ''))),
            text: undefined,
            currency: undefined,
            percent: '%',
          };
        }
        let newCurrencySetting = null;
        ['USD', 'EUR', 'DKK', 'SE', 'NOK'].forEach((currency) => {
          if (setting.includes(currency)) {
            newCurrencySetting = {
              currency,
              value: setting.replace(currency, '').trim() === '' ? null : Number(setting.replace(currency, '').trim()),
              text: undefined,
              percent: undefined,
            };
          }
        });
        if (newCurrencySetting !== null) {
          return newCurrencySetting;
        }

        return {
          value: undefined,
          text: setting,
          percent: undefined,
          currency: undefined,
        };
      }
      if (typeof setting === 'number') {
        if (setting >= 10000) {
          let abs = Math.abs(setting);
          const rounder = Math.pow(10, 1);
          const isNegative = setting < 0;
          let key = '';
          for (let i = 0; i < powers.length; i++) {
            let reduced = abs / powers[i].value;
            reduced = Math.round(reduced * rounder) / rounder;
            if (reduced >= 1) {
              abs = reduced;
              key = powers[i].key;
              break;
            }
          }

          return {
            value: undefined,
            text: (isNegative ? '-' : '') + abs + key,
            currency: undefined,
            percent: undefined,
          };
        }

        return {
          value: setting,
          text: undefined,
          currency: undefined,
          percent: undefined,
        };
      }
      if (setting instanceof Array) {
        return {
          value: setting,
          text: undefined,
          currency: undefined,
          percent: undefined,
        };
      }
      if (setting && setting.hasOwnProperty('value') && setting.hasOwnProperty('currency')) {
        return {
          value: setting.value,
          text: undefined,
          currency: setting.currency,
          percent: undefined,
        };
      }
    });

    return newSettings;
  });
}
