import { RGBA } from './formats';


export function stringToRgba(value: string): RGBA {
  const parsers = [
    {
      re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/,
      parse: (matches: string[] | null) => matches
        ? new RGBA(
          parseInt(matches[1] + matches[1], 16),
          parseInt(matches[2] + matches[2], 16),
          parseInt(matches[3] + matches[3], 16),
          1)
        : null,
    },
    {
      re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$/,
      parse: (matches: string[] | null) => matches
        ? new RGBA(
          parseInt(matches[1], 16),
          parseInt(matches[2], 16),
          parseInt(matches[3], 16),
          1)
        : null,
    },
    {
      re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})?$/,
      parse: (matches: any) => matches
        ? new RGBA(
          parseInt(matches[1], 16),
          parseInt(matches[2], 16),
          parseInt(matches[3], 16),
          parseInt(matches[4] || 'FF', 16) / 255)
        : null,
    },
    {
      re: /(rgb)a?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*%?,\s*(\d{1,3})\s*%?(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
      parse: (matches: any) => matches
        ? new RGBA(
          parseInt(matches[2], 10),
          parseInt(matches[3], 10),
          parseInt(matches[4], 10),
          isNaN(parseFloat(matches[5])) ? 1 : parseFloat(matches[5]))
        : null,
    },
  ];

  for (const parser of parsers) {
    const matches = parser.re.exec(value);
    if (matches) {
      return parser.parse(matches);
    }
  }

  console.error(`Invalid color: ${value}. Supported formats are: hex, hex8, rgb, rgba`);

  return new RGBA(255, 255, 255, 1);
}
