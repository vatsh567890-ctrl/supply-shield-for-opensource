import { z } from "zod";

const GITHUB_PR_REGEX =
  /^https:\/\/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)\/pull\/([1-9][0-9]*)$/;

export const ScanUrlSchema = z
  .string()
  .trim()
  .refine((url) => !url.includes("?") && !url.includes("#"), {
    message: "Pull request URL must not contain query parameters or fragments.",
  })
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return !parsed.port;
      } catch {
        return false;
      }
    },
    {
      message: "Pull request URL must not contain explicit port numbers.",
    }
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return !parsed.username && !parsed.password;
      } catch {
        return false;
      }
    },
    {
      message: "Pull request URL must not contain user credentials.",
    }
  )
  .refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname.toLowerCase() === "github.com";
      } catch {
        return false;
      }
    },
    {
      message: "Pull request URL must be hosted on github.com.",
    }
  )
  .refine((url) => GITHUB_PR_REGEX.test(url), {
    message:
      "Invalid GitHub pull request URL. Format: https://github.com/{owner}/{repo}/pull/{number}",
  });

export type ScanUrlInput = z.infer<typeof ScanUrlSchema>;
