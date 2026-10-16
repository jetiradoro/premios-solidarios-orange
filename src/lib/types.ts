export type Category = {
	slug: string;
	name: string;
	url: string;
	order: number;
};

export type DataItem = { label: string; value: string; html?: string };

export type Project = {
	id: number;
	slug: string;
	number: string;
	title: string;
	entity: string;
	entityFull?: string;
	category: string;
	url: string;
	image?: string;
	logo?: string;
	contentHtml: string;
	data: DataItem[];
	scrapedAt: string;
};

export type VotesSnapshot = {
	updatedAt: string;
	votes: Record<string, number>;
};

/** Override guardado en localStorage tras sincronizar el detalle. */
export type ProjectOverride = Partial<Project> & { syncedAt: string };
