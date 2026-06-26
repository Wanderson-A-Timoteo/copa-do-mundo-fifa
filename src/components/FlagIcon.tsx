import * as flags from "country-flag-icons/react/3x2";

const flagMap: Record<string, React.FC<{ className?: string }>> = {
  br: flags.BR, de: flags.DE, sa: flags.SA, ar: flags.AR, au: flags.AU,
  at: flags.AT, ba: flags.BA, be: flags.BE, ca: flags.CA, cv: flags.CV,
  cw: flags.CW, ht: flags.HT, qa: flags.QA, co: flags.CO, kr: flags.KR,
  ci: flags.CI, hr: flags.HR, eg: flags.EG, ec: flags.EC,
  es: flags.ES, us: flags.US, fr: flags.FR, gh: flags.GH, nl: flags.NL,
  hu: flags.HU, ir: flags.IR, iq: flags.IQ, jm: flags.JM,
  jp: flags.JP, ma: flags.MA, mx: flags.MX, no: flags.NO,
  nz: flags.NZ, py: flags.PY, pt: flags.PT,
  cd: flags.CD, cz: flags.CZ, ro: flags.RO, sn: flags.SN,
  se: flags.SE, ch: flags.CH, tn: flags.TN, tr: flags.TR, ua: flags.UA,
  uy: flags.UY, ve: flags.VE, za: flags.ZA, pa: flags.PA, dz: flags.DZ,
  jo: flags.JO, uz: flags.UZ,
  "gb-eng": flags.GB_ENG,
  "gb-sct": flags.GB_SCT,
};

export function FlagIcon({
  codigo,
  className,
}: {
  codigo?: string | null;
  className?: string;
}) {
  const Flag = flagMap[codigo?.toLowerCase() ?? ""];
  if (!Flag) return null;
  return <Flag className={className} />;
}
