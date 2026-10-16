import categoriesJson from '../data/categories.json';
import projectsJson from '../data/projects.json';
import votesJson from '../data/votes.json';
import type { Category, Project, VotesSnapshot } from './types';

export const categories = (categoriesJson as Category[]).slice().sort((a, b) => a.order - b.order);
export const projects = projectsJson as Project[];
export const snapshot = votesJson as VotesSnapshot;

export const votesOf = (id: number) => snapshot.votes[String(id)] ?? 0;

/** Proyectos de una categoría ordenados por votos (desc) y, a igualdad, por número. */
export function rankedByCategory(slug: string): Project[] {
	return projects
		.filter((p) => p.category === slug)
		.sort((a, b) => votesOf(b.id) - votesOf(a.id) || a.number.localeCompare(b.number));
}

export const initials = (name: string) =>
	name
		.split(/\s+/)
		.filter((w) => /^\p{L}/u.test(w))
		.slice(0, 2)
		.map((w) => w[0].toUpperCase())
		.join('');

export const formatVotes = (n: number) => new Intl.NumberFormat('es-ES').format(n);
