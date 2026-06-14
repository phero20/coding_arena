import { mongoose } from "../connection";

const SystemDesignTopicSchema = new mongoose.Schema(
  {
    topic_id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    content: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Indexing for rapid sidebar fetching and sorting
SystemDesignTopicSchema.index({ order: 1 });

export type SystemDesignTopic = {
  id?: string; // Mapped by MongoBaseRepository from _id
  topic_id: string;
  slug: string;
  title: string;
  order: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SystemDesignTopicDocument = SystemDesignTopic & mongoose.Document;

export const SystemDesignTopicModel =
  mongoose.models.SystemDesignTopic ||
  mongoose.model<SystemDesignTopicDocument>("SystemDesignTopic", SystemDesignTopicSchema);
