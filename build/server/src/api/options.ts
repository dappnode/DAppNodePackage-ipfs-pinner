import { sourceTypes, SourceOption } from "../types";

export function getOptions(): SourceOption[] {
  const options: SourceOption[] = [
    {
      value: sourceTypes.apmDnpRepo,
      label: "APM repo",
      placeholder: "Repo ENS"
    },
    {
      value: sourceTypes.apmRegistry,
      label: "APM registry",
      placeholder: "Registry ENS"
    }
  ];
  return options;
}
