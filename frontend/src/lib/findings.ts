import { FindingResponse } from "./schemas/verdicts";

export interface FileGroup {
  filePath: string;
  findings: FindingResponse[];
}

export interface PackageGroup {
  packageName: string;
  ecosystem: string | null | undefined;
  version: string | null | undefined;
  files: FileGroup[];
}

export function groupFindingsByPackageAndFile(
  findings: FindingResponse[]
): PackageGroup[] {
  const packageMap = new Map<string, PackageGroup>();

  for (const finding of findings) {
    const pkgName = finding.package_name || "Root Project";
    if (!packageMap.has(pkgName)) {
      packageMap.set(pkgName, {
        packageName: pkgName,
        ecosystem: finding.package_ecosystem,
        version: finding.package_version,
        files: [],
      });
    }

    const pkgGroup = packageMap.get(pkgName)!;
    let fileGroup = pkgGroup.files.find((f) => f.filePath === finding.file_path);
    if (!fileGroup) {
      fileGroup = {
        filePath: finding.file_path,
        findings: [],
      };
      pkgGroup.files.push(fileGroup);
    }

    fileGroup.findings.push(finding);
  }

  return Array.from(packageMap.values());
}
