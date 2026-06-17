export interface IdParams {
  id: string;
}

export interface CreateSystemDesignTopicPayload {
  topic_id: string;
  slug: string;
  title: string;
  order: number;
  content: string;
}

export interface UpdateSystemDesignTopicPayload {
  topic_id?: string;
  slug?: string;
  title?: string;
  order?: number;
  content?: string;
}

export interface BulkReorderSystemDesignTopicsPayload {
  mappings: Array<{ id: string; order: number }>;
}
