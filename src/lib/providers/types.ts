export interface ProviderProfile {
  linkedin_url: string;
  full_name: string | null;
  headline: string | null;
  current_company: string | null;
  current_title: string | null;
  location: string | null;
  avatar_url: string | null;
  about: string | null;
  github_handle: string | null;
  x_handle: string | null;
  raw: unknown;
}

export interface ProfileProvider {
  readonly name: string;
  fetch(linkedinUrl: string): Promise<ProviderProfile>;
}
