/** Única fuente de verdad de los selectores de https://voluntariado.masorange.es/ (ver specs/003-scraping.md). */
export const ORIGIN = 'https://voluntariado.masorange.es';

export const SEL = {
	// Listado de categoría
	card: 'li.js-candidature-list-item article.candidature-card',
	cardNumber: '.candidature-card__number',
	cardVotes: '[data-vote-count]',
	cardTitleLink: '.candidature-card__title a',
	cardEntity: '.candidature-card__entity',
	cardImage: '.candidature-card__image img',
	// Detalle
	detailCategory: '.candidature-detail__category',
	detailTitle: 'h1.candidature-detail__title',
	detailVotes: '.candidature-detail__votes[data-vote-count]',
	detailVoteButton: '.candidature-detail__vote-button[data-candidature]',
	detailImage: 'figure.candidature-detail__image img',
	detailContent: '.candidature-detail__content',
	detailLogo: '.candidature-detail__logo img',
	detailDataItem: 'dl.candidature-detail__data > .candidature-detail__data-item',
} as const;

export const CATEGORIES = [
	{ slug: 'compromiso-con-el-medio-ambiente', name: 'Compromiso con el medio ambiente' },
	{ slug: 'educacion-digital', name: 'Educación digital' },
	{ slug: 'tecnologia-con-proposito', name: 'Tecnología con propósito' },
] as const;

export const categoryUrl = (slug: string) => `${ORIGIN}/candidaturas/${slug}/`;
export const projectUrl = (slug: string) => `${ORIGIN}/candidatura/${slug}/`;
