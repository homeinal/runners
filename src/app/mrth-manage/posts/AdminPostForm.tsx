'use client';

import { useState, type FormEvent } from "react";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  contentMd: "",
  coverImageUrl: "",
  status: "draft",
  publishedAt: "",
};

const DEFAULT_SUCCESS = "Post saved.";

type PostFormData = typeof initialForm;

type AdminPostFormProps = {
  initialData?: PostFormData;
  submitUrl?: string;
  submitMethod?: "POST" | "PUT";
  successMessage?: string;
  resetAfterSubmit?: boolean;
  onSuccess?: (data: Record<string, unknown>) => void;
};

export default function AdminPostForm({
  initialData,
  submitUrl,
  submitMethod = "POST",
  successMessage = DEFAULT_SUCCESS,
  resetAfterSubmit = true,
  onSuccess,
}: AdminPostFormProps) {
  const createInitialState = (): PostFormData =>
    initialData ? { ...initialData } : { ...initialForm };

  const [formData, setFormData] = useState<PostFormData>(createInitialState);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof PostFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const endpoint = submitUrl ?? "/api/admin/posts";
      const response = await fetch(endpoint, {
        method: submitMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          publishedAt: formData.publishedAt || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Unable to complete the request.");
      }

      const payload = await response.json();
      onSuccess?.(payload);

      setFeedback({
        type: "success",
        message: successMessage,
      });

      if (resetAfterSubmit) {
        setFormData({ ...initialForm });
      }
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error ? error.message : "Request failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-sm text-gray-600">
          Title
          <input
            type="text"
            value={formData.title}
            onChange={(event) => handleChange("title", event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
        <label className="block text-sm text-gray-600">
          Slug
          <input
            type="text"
            value={formData.slug}
            onChange={(event) => handleChange("slug", event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-sm text-gray-600">
          Status
          <select
            value={formData.status}
            onChange={(event) => handleChange("status", event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          >
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </select>
        </label>
        <label className="block text-sm text-gray-600">
          Publish Date (optional)
          <input
            type="datetime-local"
            value={formData.publishedAt}
            onChange={(event) => handleChange("publishedAt", event.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm text-gray-600">
        Cover Image URL
        <input
          type="url"
          value={formData.coverImageUrl}
          onChange={(event) => handleChange("coverImageUrl", event.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
      </label>

      <label className="block text-sm text-gray-600">
        Excerpt
        <textarea
          value={formData.excerpt}
          onChange={(event) => handleChange("excerpt", event.target.value)}
          rows={2}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
      </label>

      <label className="block text-sm text-gray-600">
        Content (Markdown)
        <textarea
          value={formData.contentMd}
          onChange={(event) => handleChange("contentMd", event.target.value)}
          rows={8}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
        />
      </label>

      {feedback && (
        <p
          className={`text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
        >
          {feedback.message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition-colors disabled:bg-gray-400"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
