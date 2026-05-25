export interface Track {
  slug: string;
  title: string;
  course: boolean;
  num_concepts: number;
  num_exercises: number;
  web_url: string;
  icon_url: string;
  tags: string[];
  last_touched_at: string | null;
  is_new: boolean;
  links: {
    self: string;
    exercises: string;
    concepts: string;
  };
}

export interface TracksResponse {
  tracks: Track[];
}

export interface TrackConfigResponse {
  language: string;
  slug: string;
  active: boolean;
  blurb: string;
  version: number;
  exercises: {
    concept: Array<any>;
    practice: Array<any>;
  };
  concepts: Array<any>;
  key_features?: Array<{
    icon: string;
    title: string;
    content: string;
  }>;
  [key: string]: any; // Allow flexible parsing of other fields for now
}

export interface TrackConceptResponse {
  slug: string;
  name: string;
  introduction: string;
  about: string;
}
